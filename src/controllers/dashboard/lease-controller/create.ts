import mongoose from "mongoose";
import ApartmentModel from "../../../entities/apartment/model";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import { ILease, TDocumentURL } from "../../../entities/lease/i";
import LeaseModel from "../../../entities/lease/model";
import { ENUMRentPaymentStatus } from "../../../entities/rent/enum";
import { IRent } from "../../../entities/rent/i";
import RentModel from "../../../entities/rent/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IImage } from "../../../interfaces/image";
import { IReturnObj } from "../../../interfaces/return-obj";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_leaseSchema } from "./utils/zod-schema";
import {
  addMonths,
  differenceInMonths,
  startOfMonth,
  setDate,
  format,
} from "date-fns";
import DependentModel from "../../../entities/dependant/model";
import { TEmailOptions } from "../../../configurations/email-api/types";
import { sendTransactionalEmail } from "../../../configurations/email-api/brevo";
import ParkingModel from "../../../entities/parking/model";
import { ENUMLeaseStatus } from "../../../entities/lease/enum";
import { createPaymentIntent } from "../../../services/stripe/payment-intent";

interface ICreateLease extends Omit<ILease, "documentURLs"> {
  documentURLs: IImage[];
  additionalParkingSlots: number;
}

export const CreateLease = async (
  inputs: ICreateLease
): Promise<IReturnObj> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // START : INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END : INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START : INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_leaseSchema,
      trimmedInputs
    );
    if (validationErrors) {
      await session.abortTransaction();

      return validationErrors;
    }
    // END : INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START : CHECK

    // Check if a lease already exosts for this occupant
    const isLeaseExists = await LeaseModel.exists({
      chiefOccupantId: trimmedInputs.chiefOccupantId,
      status: ENUMLeaseStatus.Active,
    });
    if (isLeaseExists) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["This occupant already has an active lease"],
      };
    }

    // Chief Occupant active
    const isChiefOccupantActive = await ChiefOccupantModel.exists({
      _id: trimmedInputs.chiefOccupantId, // Corrected to use `chiefOccupantId`
      status: "Active", // Fixed to check for "Active" status directly
    });

    if (!isChiefOccupantActive) {
      const messages = [];
      if (!isChiefOccupantActive)
        messages.push("Selected Chief Occupant is not active");

      await session.abortTransaction();

      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: messages,
      };
    }
    // END : CHECK

    // ----------------------------------------------------------------

    // START : LEASE DURATION VALIDATION
    const start = new Date(trimmedInputs.startDate);
    const end = new Date(trimmedInputs.endDate);
    const differenceInTime = end.getTime() - start.getTime();
    const approxDifferenceInMonths =
      differenceInTime / (1000 * 60 * 60 * 24 * 30.44);

    if (approxDifferenceInMonths < 6 || start >= end) {
      await session.abortTransaction();

      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: [
          "Lease must be at least 6 months long",
          ...(start >= end ? ["End date must be after the start date"] : []),
        ],
      };
    }
    // END : LEASE DURATION VALIDATION

    // ----------------------------------------------------------------

    // START : MAKE DOCUMENT URL ARRAY
    const documentURLs: TDocumentURL[] = trimmedInputs.documentURLs.map(
      ({ alt: name = "NA", url }) => ({ name, url })
    );
    // END : MAKE DOCUMENT URL ARRAY

    // ----------------------------------------------------------------

    // START : SAVE LEASE
    const newLease = new LeaseModel({ ...trimmedInputs, documentURLs });

    const leaseResult = await newLease.save({ session });
    // END : SAVE LEASE

    // ----------------------------------------------------------------

    // START : ASSIGN PARKING SLOTS

    // Get related building
    const relatedApartment = await ApartmentModel.findById(
      trimmedInputs.apartmentId
    )
      .populate("buildingId")
      .lean();

    if (!relatedApartment || !relatedApartment.buildingId) {
      await session.abortTransaction();
      await session.endSession();
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Related building was not found"],
      };
    }

    const building: any = relatedApartment?.buildingId;

    let parkingSlotCharges = 0;
    let parkingSlotNumbers: string[] = [];

    // Get available parking slots
    const availableParkingSlots = await ParkingModel.find({
      buildingId: building._id.toString(),
      status: "Available",
    }).lean();

    if (availableParkingSlots.length === 0) {
      // Reduce charges if no parking slot is available
      parkingSlotCharges -= Number(building.chargePerExtraParkingSlotInUSD);
    } else {
      // Assign first parking slot - First parking slot is free
      const firstParkingSlot = await ParkingModel.findByIdAndUpdate(
        availableParkingSlots[0]._id,
        {
          leaseId: leaseResult._id,
          status: "Occupied",
        },
        { new: true }
      );

      if (!firstParkingSlot) {
        await session.abortTransaction();
        await session.endSession();
        return {
          statusCode: ENUMHttpStatusCode.BAD_REQUEST,
          message: ["Parking slot could not be assigned"],
        };
      }

      // Store the first free parking slot number
      parkingSlotNumbers = [firstParkingSlot.slotNumber];

      // Handle additional parking slots
      trimmedInputs.additionalParkingSlots = Number(
        trimmedInputs.additionalParkingSlots
      );

      if (trimmedInputs.additionalParkingSlots > 0) {
        let remainingSlots = availableParkingSlots.slice(1); // Skip the first slot which is already assigned
        let assignedCount = 0;

        for (let i = 0; i < trimmedInputs.additionalParkingSlots; i++) {
          if (remainingSlots.length === 0) {
            break; // No more slots available
          }

          const additionalSlot = await ParkingModel.findByIdAndUpdate(
            remainingSlots[0]._id,
            {
              leaseId: leaseResult._id,
              status: "Occupied",
            },
            { new: true }
          );

          if (!additionalSlot) {
            return {
              statusCode: ENUMHttpStatusCode.BAD_REQUEST,
              message: [],
            };
          }

          parkingSlotNumbers.push(additionalSlot.slotNumber);
          parkingSlotCharges += Number(building.chargePerExtraParkingSlotInUSD); // Increase charges
          remainingSlots = remainingSlots.slice(1); // Remove the assigned slot from the list
          assignedCount++;
        }

        if (assignedCount < trimmedInputs.additionalParkingSlots) {
          return {
            statusCode: ENUMHttpStatusCode.BAD_REQUEST,
            message: [
              `Only ${assignedCount} additional parking slots assigned out of requested ${trimmedInputs.additionalParkingSlots}`,
            ],
          };
        }
      }
    }
    // END : ASSIGN PARKING SLOTS

    // ----------------------------------------------------------------

    // START : CREATE RENT SLOTS
    const leaseId: IRent["leaseId"] = leaseResult.toObject()._id as string;
    if (!leaseId) {
      await session.abortTransaction();

      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Lease could not be created. Try again."],
      };
    }

    const { startDate, endDate, rentAmountInUSD } = trimmedInputs;

    const totalMonths =
      differenceInMonths(new Date(endDate), new Date(startDate)) + 1;
    const rentSlots: IRent[] = [];

    for (let i = 0; i < totalMonths; i++) {
      const currentMonth = addMonths(startOfMonth(new Date(startDate)), i);
      const dueDate = setDate(currentMonth, 25);

      let amount = rentAmountInUSD + parkingSlotCharges;

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

    const rentSlotsResult = await RentModel.insertMany(rentSlots, { session });
    // END : CREATE RENT SLOTS

    // ----------------------------------------------------------------

    // START : GET DETAILS TO RETURN
    const leaseResultObj = leaseResult.toObject();
    const [involvedApartment, involvedOccupant, dependants] =
      (await Promise.all([
        ApartmentModel.findById(trimmedInputs.apartmentId)
          .populate("buildingId")
          .lean(),
        ChiefOccupantModel.findById(trimmedInputs.chiefOccupantId)
          .populate("apartmentId")
          .lean(),
        DependentModel.find({
          chiefOccupantId: trimmedInputs.chiefOccupantId,
        }).lean(),
      ])) as any;
    // END : GET DETAILS TO RETURN

    // ----------------------------------------------------------------

    // START : SEND EMAIL
    const firstName = involvedOccupant?.fullName?.split(" ")[0];
    const emailOptions: TEmailOptions = {
      to: [{ email: involvedOccupant?.email ?? "", name: firstName }],
      subject: "Lease Agreement",
      templateType: "brevo",
      templateData: {
        id: "14",
        params: {
          firstName: firstName,
          leaseIdentification: `#${leaseResultObj._id}`,
          leaseStartDate: format(
            new Date(leaseResultObj.startDate),
            "dd MMMM yyyy"
          ),
          leaseEndDate: format(
            new Date(leaseResultObj.endDate),
            "dd MMMM yyyy"
          ),
          leaseSecurityDepositInUSD: leaseResultObj.securityDepositInUSD,
          leasePaymentSchedule: leaseResultObj.paymentSchedule,
          leaseStatus: leaseResultObj.status,
          leaseTermsAndConditions: leaseResultObj.termsAndConditions,
          relatedApartmentBuildingName:
            involvedApartment?.buildingId?.buildingName,
          relatedApartmentBuildingAddress:
            involvedApartment?.buildingId?.address,
          relatedApartmentIdentification: involvedApartment?.identification,
          relatedApartmentClass: involvedApartment?.class,
          relatedApartmentStatus: involvedApartment?.status,
          dependantCount: dependants.length,
          parkingSlotCharges,
          parkingSlotNumbers: parkingSlotNumbers.join(", "),
          additionalParkingSlotCount: `${parkingSlotNumbers.length - 1} ($${
            parkingSlotCharges / (parkingSlotNumbers.length - 1)
          } per slot)`,
          baseRentAmount: leaseResultObj.rentAmountInUSD,
          leaseRentAmountInUSD:
            leaseResultObj.rentAmountInUSD + parkingSlotCharges,
        },
      },
    };

    sendTransactionalEmail(emailOptions);
    // END : SEND EMAIL

    // ----------------------------------------------------------------

    await session.commitTransaction();

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Lease created successfully"],
      data: {
        lease: leaseResultObj,
        rentSlots: rentSlotsResult.map((slot) => slot.toObject()),
        apartment: involvedApartment,
        chiefOccupant: involvedOccupant,
        dependants,
        parkingSlotCharges,
        parkingSlotNumbers,
      },
    };

    // ----------------------------------------------------------------
  } catch (e) {
    console.log("Lease Creation Error:", e);

    await session.abortTransaction();

    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  } finally {
    session.endSession();
  }
};
