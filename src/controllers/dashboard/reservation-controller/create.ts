import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ReservationModel from "../../../entities/reservation/model";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import ApartmentModel from "../../../entities/apartment/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_reservationSchema } from "./utils/zod-schema";
import { IReservation } from "../../../entities/reservation/i";

export const CreateReservation = async (
  inputs: Omit<IReservation, "_id">
): Promise<IReturnObj> => {
  try {
    // START : INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END : INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START : INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_reservationSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START : CHIEF OCCUPANT VALIDATION
    const chiefOccupantExists = await ChiefOccupantModel.findOne({
      _id: trimmedInputs.chiefOccupantId,
    });

    if (!chiefOccupantExists) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Chief occupant not found"],
      };
    }
    // END : CHIEF OCCUPANT VALIDATION

    // ----------------------------------------------------------------

    // START : APARTMENT VALIDATION
    const apartmentExists = await ApartmentModel.findOne({
      _id: trimmedInputs.apartmentId,
    });

    if (!apartmentExists) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Apartment not found"],
      };
    }
    // END : APARTMENT VALIDATION

    // ----------------------------------------------------------------

    // START : CHECK FOR CONFLICTING RESERVATION
    if (trimmedInputs.reservationDate) {
      const conflict = await ReservationModel.findOne({
        apartmentId: trimmedInputs.apartmentId,
        reservationDate: trimmedInputs.reservationDate,
        status: {
          $nin: ["Rejected", "Completed"], // $nin checks that the status is not in the given array
        },
      });

      if (conflict) {
        return {
          statusCode: ENUMHttpStatusCode.CONFLICT,
          message: [
            "A reservation already exists for this apartment on the selected date",
          ],
        };
      }
    }
    // END : CHECK FOR CONFLICTING RESERVATION

    // ----------------------------------------------------------------

    // START : CREATE RESERVATION
    const newReservation = new ReservationModel(trimmedInputs);

    await newReservation.save();
    // END : CREATE RESERVATION

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Reservation created successfully"],
      data: newReservation.toObject(),
    };
  } catch (e) {
    console.error("Create Reservation Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
