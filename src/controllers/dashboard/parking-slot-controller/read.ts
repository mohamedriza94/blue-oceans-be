import ParkingModel from "../../../entities/parking/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IParkingSearchParams {
  buildingId?: string;
  slotNumber?: string;
  status?: "Available" | "Occupied";
}

export interface IParkingQueryParams
  extends IPaginationParams,
    IParkingSearchParams {}

export const ReadManyParkingSlots = async (
  queryParams: IParkingQueryParams
): Promise<IReturnObj> => {
  try {
    // START : PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      buildingId,
      slotNumber,
      status,
    } = cleanedParams as IParkingQueryParams;
    // END : PROCESS PARAMS

    // ----------------------------------------------------------------

    // START : APPLYING PARAMS
    const dbQuery: any = {};

    // --- FILTER BY BUILDING ID
    if (buildingId) {
      dbQuery.buildingId = buildingId;
    }

    // --- FILTER BY SLOT NUMBER
    if (slotNumber) {
      dbQuery.slotNumber = { $regex: slotNumber, $options: "i" };
    }

    // --- FILTER BY STATUS
    if (status) {
      dbQuery.status = status;
    }

    // --- PAGINATION
    const skip = (page - 1) * limit;
    // END : APPLYING PARAMS

    // ----------------------------------------------------------------

    // START : QUERYING THE DATABASE
    const results = await ParkingModel.find(dbQuery)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await ParkingModel.countDocuments(dbQuery);
    // END : QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        parkingSlots: results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (e) {
    console.log("Read Many Parking Slots Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
