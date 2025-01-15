import LeaseModel from "../../../entities/lease/model";
import { ENUMLeaseStatus } from "../../../entities/lease/enum";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface ILeaseSearchParams {
  chiefOccupantId?: string;
  apartmentId?: string;
  status?: ENUMLeaseStatus;
}

export interface ILeaseQueryParams
  extends IPaginationParams,
    ILeaseSearchParams {}

export const ReadManyLeases = async (
  queryParams: ILeaseQueryParams
): Promise<IReturnObj> => {
  try {
    // START: PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      chiefOccupantId,
      apartmentId,
      status,
    } = cleanedParams as ILeaseQueryParams;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Page and limit must be valid numbers"],
      };
    }
    // END: PROCESS PARAMS

    // ----------------------------------------------------------------

    // START: APPLYING PARAMS
    const dbQuery: any = {};

    // --- FILTER BY CHIEF OCCUPANT ID
    if (chiefOccupantId) {
      dbQuery.chiefOccupantId = chiefOccupantId;
    }

    // --- FILTER BY APARTMENT ID
    if (apartmentId) {
      dbQuery.apartmentId = apartmentId;
    }

    // --- FILTER BY STATUS
    if (status) {
      dbQuery.status = status;
    }

    // --- PAGINATION
    const skip = (pageNumber - 1) * limitNumber;
    // END: APPLYING PARAMS

    // ----------------------------------------------------------------

    // START: QUERYING THE DATABASE
    const leases = await LeaseModel.find(dbQuery)
      .populate("chiefOccupantId")
      .populate("apartmentId")
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await LeaseModel.countDocuments(dbQuery);
    // END: QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        leases,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber),
        },
      },
    };
  } catch (e) {
    console.log("Read Many Leases Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
