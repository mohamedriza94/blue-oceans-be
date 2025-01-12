import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ReservationModel from "../../../entities/reservation/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { getModifiedFields } from "../../../utils/get-modified-fields";
import { ZOD_reservationSchema } from "./utils/zod-schema";
import { IReservation } from "../../../entities/reservation/i";

export const UpdateReservation = async (
  reservationID: string,
  inputs: Partial<IReservation>
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE RESERVATION ID
    if (!reservationID || !isValidObjectId(reservationID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Reservation identifier is missing or invalid"],
      };
    }
    // END : VALIDATE RESERVATION ID

    // ----------------------------------------------------------------

    // START : FETCH CURRENT DETAILS
    const reservation = await ReservationModel.findOne({ _id: reservationID });

    if (!reservation) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Reservation was not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : INPUT PROCESSING
    const trimmedInputs: typeof inputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_reservationSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT PROCESSING

    // ----------------------------------------------------------------

    // START : CHECK FOR CONFLICTING RESERVATION
    if (trimmedInputs.reservationDate) {
      const conflict = await ReservationModel.findOne({
        apartmentId: reservation.apartmentId,
        reservationDate: trimmedInputs.reservationDate,
        _id: { $ne: reservationID }, // Exclude the current reservation
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

    // START : GET MODIFIED FIELDS
    const modifiedFields = getModifiedFields(
      trimmedInputs,
      reservation.toObject()
    );
    // END : GET MODIFIED FIELDS

    // ----------------------------------------------------------------

    // START : PERFORM UPDATE
    if (Object.keys(modifiedFields).length > 0) {
      await ReservationModel.findByIdAndUpdate(reservationID, modifiedFields, {
        new: true,
      });

      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Reservation update successful"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No changes detected"],
      };
    }
    // END : PERFORM UPDATE
  } catch (e) {
    console.error("Update Reservation Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
