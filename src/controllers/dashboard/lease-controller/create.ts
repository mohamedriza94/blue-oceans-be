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
import { addMonths, differenceInMonths, startOfMonth, setDate } from "date-fns";
import DependentModel from "../../../entities/dependant/model";

interface ICreateLease extends Omit<ILease, "documentURLs"> {
  documentURLs: IImage[];
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
      return validationErrors;
    }
    // END : INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START : CHECK

    // Apartment availability
    const isApartmentAvailable = await ApartmentModel.exists({
      _id: trimmedInputs.apartmentId,
      status: { $ne: "Occupied" },
    });

    // Chief Occupant active
    const isChiefOccupantActive = await ChiefOccupantModel.exists({
      _id: trimmedInputs.chiefOccupantId, // Corrected to use `chiefOccupantId`
      status: "Active", // Fixed to check for "Active" status directly
    });

    if (!isApartmentAvailable || !isChiefOccupantActive) {
      const messages = [];
      if (!isApartmentAvailable)
        messages.push("This Apartment is not available");
      if (!isChiefOccupantActive)
        messages.push("Selected Chief Occupant is not active");

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

    // START : CREATE RENT SLOTS
    const leaseId: IRent["leaseId"] = leaseResult.toObject()._id as string;
    if (!leaseId) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Lease could not be created. Try again."],
      };
    }

    const { startDate, endDate, rentAmountInUSD, paymentSchedule } =
      trimmedInputs;

    const totalMonths =
      differenceInMonths(new Date(endDate), new Date(startDate)) + 1;
    const rentSlots: IRent[] = [];

    for (let i = 0; i < totalMonths; i++) {
      const currentMonth = addMonths(startOfMonth(new Date(startDate)), i);
      const dueDate = setDate(currentMonth, 25);

      let amount = rentAmountInUSD;

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

      rentSlots.push({
        leaseId,
        dueDate,
        amount: Math.round(amount),
        paymentStatus: ENUMRentPaymentStatus.Pending,
      });
    }

    const rentSlotsResult = await RentModel.insertMany(rentSlots, { session });
    // END : CREATE RENT SLOTS

    await ApartmentModel.findByIdAndUpdate(
      trimmedInputs.apartmentId,
      { status: "Occupied" },
      { session }
    );

    const [involvedApartment, involvedOccupant, dependants] = await Promise.all(
      [
        ApartmentModel.findById(trimmedInputs.apartmentId)
          .populate("buildingId")
          .lean(),
        ChiefOccupantModel.findById(trimmedInputs.chiefOccupantId)
          .populate("apartmentId")
          .lean(),
        DependentModel.find({
          chiefOccupantId: trimmedInputs.chiefOccupantId,
        }).lean(),
      ]
    );

    await session.commitTransaction();

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Lease created successfully"],
      data: {
        lease: leaseResult.toObject(),
        rentSlots: rentSlotsResult.map((slot) => slot.toObject()),
        apartment: involvedApartment,
        chiefOccupant: involvedOccupant,
        dependants,
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
