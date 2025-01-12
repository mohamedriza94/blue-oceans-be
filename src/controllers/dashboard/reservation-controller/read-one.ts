import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ReservationModel from "../../../entities/reservation/model";

export const ReadOneReservation = async (
  reservationID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!reservationID || !isValidObjectId(reservationID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Reservation identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const reservation = await ReservationModel.findOne({ _id: reservationID })
      .populate("chiefOccupantId", "fullName contactNumber email") // Populates chief occupant details
      .populate("apartmentId", "description class status") // Populates apartment details
      .lean();

    if (!reservation) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Reservation not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: reservation,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Reservation Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
