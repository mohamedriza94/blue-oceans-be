import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IChiefOccupantSearchParams {
  apartmentId?: string;
  fullName?: string;
  status?: "Active" | "Inactive";
}

export interface IChiefOccupantQueryParams
  extends IPaginationParams,
    IChiefOccupantSearchParams {}

export const ReadManyChiefOccupants = async (
  queryParams: IChiefOccupantQueryParams
): Promise<IReturnObj> => {
  try {
    // START : PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      apartmentId,
      fullName,
      status,
    } = cleanedParams as IChiefOccupantQueryParams;
    // END : PROCESS PARAMS

    // ----------------------------------------------------------------

    // START : APPLYING PARAMS
    const dbQuery: any = {};

    // --- FILTER BY APARTMENT ID
    if (apartmentId) {
      dbQuery.apartmentId = apartmentId;
    }

    // --- FILTER BY FULL NAME
    if (fullName) {
      dbQuery.fullName = { $regex: fullName, $options: "i" }; // Case-insensitive search
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
    const results = await ChiefOccupantModel.find(dbQuery)
      .populate("apartmentId", "description class status") // Populates apartment details
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await ChiefOccupantModel.countDocuments(dbQuery);
    // END : QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        chiefOccupants: results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (e) {
    console.log("Read Many Chief Occupants Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
