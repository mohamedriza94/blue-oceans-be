import { ENUMExtRequest } from "../../../entities/extension-request/enum";
import ExtensionRequestModel from "../../../entities/extension-request/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IExtensionRequestFilterParams {
  status?: ENUMExtRequest;
}

export interface IExtensionRequestQueryParams
  extends IPaginationParams,
    IExtensionRequestFilterParams {}

export const ReadManyExtensionRequests = async (
  queryParams: IExtensionRequestQueryParams
): Promise<IReturnObj> => {
  try {
    // START : PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      status,
    } = cleanedParams as IExtensionRequestQueryParams;
    // END : PROCESS PARAMS

    // ----------------------------------------------------------------

    // START : APPLYING PARAMS
    const dbQuery: any = {};

    // --- FILTER BY STATUS
    if (status) {
      dbQuery.status = status;
    }

    // --- PAGINATION
    const skip = (page - 1) * limit;
    // END : APPLYING PARAMS

    // ----------------------------------------------------------------

    // START : QUERYING THE DATABASE
    const results = await ExtensionRequestModel.find(dbQuery)
      .populate({
        path: "leaseId",
        populate: {
          path: "chiefOccupantId",
        },
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await ExtensionRequestModel.countDocuments(dbQuery);
    // END : QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        extensionRequests: results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (e) {
    console.error("Read Many Extension Requests Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
