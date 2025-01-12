import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ReservationModel from "../../../entities/reservation/model";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IReservationSearchParams {
  chiefOccupantId?: string;
  apartmentId?: string;
  reservationDate?: Date;
  status?: "Pending" | "Approved" | "Rejected" | "Completed";
}

export const ReadManyReservations = async (
  queryParams: IReservationSearchParams
): Promise<IReturnObj> => {
  try {
    // START : PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const { chiefOccupantId, apartmentId, reservationDate, status } =
      cleanedParams;
    // END : PROCESS PARAMS

    // ----------------------------------------------------------------

    // START : APPLYING PARAMS
    const dbQuery: any = {};

    // --- FILTER BY CHIEF OCCUPANT ID
    if (chiefOccupantId) {
      dbQuery.chiefOccupantId = chiefOccupantId;
    }

    // --- FILTER BY APARTMENT ID
    if (apartmentId) {
      dbQuery.apartmentId = apartmentId;
    }

    // --- FILTER BY RESERVATION DATE
    if (reservationDate) {
      dbQuery.reservationDate = reservationDate;
    }

    // --- FILTER BY STATUS
    if (status) {
      dbQuery.status = status;
    }
    // END : APPLYING PARAMS

    // ----------------------------------------------------------------

    // START : QUERYING THE DATABASE
    const reservations = await ReservationModel.find(dbQuery)
      .populate("chiefOccupantId", "fullName contactNumber email") // Populates chief occupant details
      .populate("apartmentId", "description class status") // Populates apartment details
      .lean()
      .exec();
    // END : QUERYING THE DATABASE

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: reservations,
    };
  } catch (e) {
    console.error("Read Many Reservations Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
