import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ReservationModel from "../../../entities/reservation/model";

export const DeleteReservation = async (
  reservationID: string
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
        message: ["Reservation not found"],
      };
    }

    // --- CHECK STATUS
    if (!["Rejected", "Completed"].includes(reservation.status || "")) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Only 'Rejected' or 'Completed' reservations can be deleted"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : DELETE RESERVATION
    await ReservationModel.findByIdAndDelete(reservationID);
    // END : DELETE RESERVATION

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Reservation deleted successfully"],
    };
  } catch (e) {
    console.error("Delete Reservation Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
