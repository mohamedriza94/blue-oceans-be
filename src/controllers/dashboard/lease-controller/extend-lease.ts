import { isValidObjectId } from "mongoose";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ExtensionRequestModel from "../../../entities/extension-request/model";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ILease } from "../../../entities/lease/i";
import LeaseModel from "../../../entities/lease/model";
import ParkingModel from "../../../entities/parking/model";
import { IBuilding } from "../../../entities/building/i";
import { ENUMRentPaymentStatus } from "../../../entities/rent/enum";
import RentModel from "../../../entities/rent/model";
import {
  addMonths,
  differenceInMonths,
  startOfMonth,
  setDate,
  format,
} from "date-fns";
import { IRent } from "../../../entities/rent/i";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import { TEmailOptions } from "../../../configurations/email-api/types";
import { IChiefOccupant } from "../../../entities/chief-occupant/i";
import { sendTransactionalEmail } from "../../../configurations/email-api/brevo";
import { DetailedLeaseForOccupant } from "./read-detailed-lease-for-occupant";
import { ENUMExtRequest } from "../../../entities/extension-request/enum";
import { createPaymentIntent } from "../../../services/stripe/payment-intent";

type ExtendLeaseInputs = {
  extensionRequestId: string;
};

export const ExtendLease = async ({
  extensionRequestId,
}: ExtendLeaseInputs): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!isValidObjectId(extensionRequestId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : GET EXTENSION REQUEST
    const extensionRequest = await ExtensionRequestModel.findById(
      extensionRequestId
    )
      .populate("leaseId")
      .lean();

    const lease = extensionRequest?.leaseId as unknown as ILease;

    if (!extensionRequest || !lease) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Extension request not found"],
      };
    }
    // END : GET EXTENSION REQUEST

    // ----------------------------------------------------------------

    // // START : GET RELATED LEASE
    // const leaseEndDate = lease.endDate;

    // const sixMonthsFromNow = new Date();
    // sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 1);

    // if (leaseEndDate > sixMonthsFromNow) {
    //   return {
    //     statusCode: ENUMHttpStatusCode.BAD_REQUEST,
    //     message: [
    //       "Lease extensions are only allowed within 1 month of the lease end date.",
    //     ],
    //   };
    // }
    // // END : GET RELATED LEASE

    // ----------------------------------------------------------------

    // START : EXTEND THE LEASE
    const requestedEndDate = extensionRequest.requestedEndDate;
    const currentLeaseEndDate = lease.endDate;

    await LeaseModel.findByIdAndUpdate(
      lease._id,
      { endDate: requestedEndDate },
      { new: true }
    );

    const startDate = new Date(currentLeaseEndDate);
    startDate.setDate(startDate.getDate() + 1);

    await createRentSlots({
      leaseId: lease._id!,
      endDate: requestedEndDate,
      startDate: startDate,
      rentAmountInUSD: lease.rentAmountInUSD,
    });
    // END : EXTEND THE LEASE

    // ----------------------------------------------------------------

    const involvedLease = await LeaseModel.findById(lease._id)
      .populate("chiefOccupantId")
      .lean();
    if (!involvedLease) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Lease not found"],
      };
    }

    const involvedOccupant =
      involvedLease.chiefOccupantId as unknown as IChiefOccupant;

    // START : SEND EMAIL
    const firstName = involvedOccupant?.fullName?.split(" ")[0];

    const extensionDuration = differenceInMonths(
      new Date(requestedEndDate),
      new Date(currentLeaseEndDate)
    );

    const emailOptions: TEmailOptions = {
      to: [{ email: involvedOccupant?.email ?? "", name: firstName }],
      subject: "Lease Extension",
      templateType: "brevo",
      templateData: {
        id: "16",
        params: {
          firstName: firstName,
          leaseIdentification: `#${lease._id!}`,
          newLeaseStartDate: format(
            new Date(involvedLease.startDate),
            "dd MMMM yyyy"
          ),
          newLeaseEndDate: format(
            new Date(involvedLease.endDate),
            "dd MMMM yyyy"
          ),
          leaseStatus: involvedLease.status,
          extensionDuration: `${extensionDuration} month(s)`,
        },
      },
    };

    sendTransactionalEmail(emailOptions);
    // END : SEND EMAIL

    // ----------------------------------------------------------------

    // START : SAVE EXTENSION
    await ExtensionRequestModel.findByIdAndUpdate(extensionRequestId, {
      status: ENUMExtRequest.Approved,
    });
    // END : SAVE EXTENSION

    // ----------------------------------------------------------------

    return await DetailedLeaseForOccupant(involvedLease.chiefOccupantId!);
  } catch (e) {
    console.error("Read One Request Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};

// ================================================================================================

const getTotalRentAmount = async (leaseId: string, rentAmountInUSD: number) => {
  let totalRentAmount: number = 0;

  const parkingSlots = await ParkingModel.find({ leaseId })
    .populate("buildingId")
    .lean();

  const additionalParkingSlots = parkingSlots.length - 1;

  if (additionalParkingSlots == 0) {
    return rentAmountInUSD;
  } else {
    const building = parkingSlots[0].buildingId as unknown as IBuilding;

    const parkingSlotCharge = building.chargePerExtraParkingSlotInUSD;

    totalRentAmount =
      additionalParkingSlots * parkingSlotCharge + rentAmountInUSD;

    return totalRentAmount;
  }
};

// ================================================================================================

const createRentSlots = async (inputs: {
  leaseId: string;
  startDate: Date;
  endDate: Date;
  rentAmountInUSD: number;
}) => {
  const { leaseId, startDate, endDate, rentAmountInUSD } = inputs;

  const totalRentAmountInUSD = await getTotalRentAmount(
    leaseId!,
    Number(rentAmountInUSD)
  );

  const totalMonths =
    differenceInMonths(new Date(endDate), new Date(startDate)) + 1;
  const rentSlots: IRent[] = [];

  for (let i = 0; i < totalMonths; i++) {
    const currentMonth = addMonths(startOfMonth(new Date(startDate)), i);
    const dueDate = setDate(currentMonth, 25);

    let amount = totalRentAmountInUSD;

    if (i === 0) {
      const daysInFirstMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      ).getDate();
      const startDay = new Date(startDate).getDate();
      amount =
        ((daysInFirstMonth - startDay + 1) / daysInFirstMonth) *
        rentAmountInUSD;
    }

    if (i === totalMonths - 1) {
      const endDay = new Date(endDate).getDate();
      const daysInLastMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      ).getDate();
      amount = (endDay / daysInLastMonth) * rentAmountInUSD;
    }

    const paymentIntent = await createPaymentIntent({
      total: Math.round(amount),
      description: `rent for ${leaseId} ${dueDate}`,
      transferGroup: `rent for ${leaseId}`,
    });

    rentSlots.push({
      leaseId,
      dueDate,
      amount: Math.round(amount),
      paymentStatus: ENUMRentPaymentStatus.Pending,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  }

  return await RentModel.insertMany(rentSlots);
};
