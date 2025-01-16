import RentModel from "../../../entities/rent/model";
import { ENUMRentPaymentStatus } from "../../../entities/rent/enum";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IRentSearchParams {
  leaseId?: string;
  paymentStatus?: ENUMRentPaymentStatus;
}

export interface IRentQueryParams
  extends IPaginationParams,
    IRentSearchParams {}

export const ReadRentsForOccupant = async (
  queryParams: IRentQueryParams
): Promise<IReturnObj> => {
  try {
    // START: PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      leaseId,
      paymentStatus,
    } = cleanedParams as IRentQueryParams;

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

    // --- FILTER BY LEASE ID
    if (leaseId) {
      dbQuery.leaseId = leaseId;
    }

    // --- FILTER BY PAYMENT STATUS
    if (paymentStatus) {
      dbQuery.paymentStatus = paymentStatus;
    }

    // --- PAGINATION
    const skip = (pageNumber - 1) * limitNumber;
    // END: APPLYING PARAMS

    // ----------------------------------------------------------------

    // START: QUERYING THE DATABASE
    const rents = await RentModel.find(dbQuery)
      .skip(skip)
      .limit(limitNumber)
      .lean()
      .exec();
    const totalCount = await RentModel.countDocuments(dbQuery);
    // END: QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        rents,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber),
        },
      },
    };
  } catch (e) {
    console.log("Read Rents Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
