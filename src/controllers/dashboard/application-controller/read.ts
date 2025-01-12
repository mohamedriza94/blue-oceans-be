import ApplicationModel from "../../../entities/application/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IApplicationSearchParams {
  subject?: string;
}

interface IApplicationFilterParams {
  apartmentId?: string;
  chiefOccupantId?: string;
  submittedAt?: Date;
  status?: "Pending" | "Reviewed" | "Approved" | "Rejected";
}

export interface IApplicationQueryParams
  extends IPaginationParams,
    IApplicationSearchParams,
    IApplicationFilterParams {}

export const ReadManyApplications = async (
  queryParams: IApplicationQueryParams
): Promise<IReturnObj> => {
  try {
    // START : PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      apartmentId,
      chiefOccupantId,
      submittedAt,
      status,
      subject,
    } = cleanedParams as IApplicationQueryParams;
    // END : PROCESS PARAMS

    // ----------------------------------------------------------------

    // START : APPLYING FILTERS
    const dbQuery: any = {};

    if (apartmentId) {
      dbQuery.apartmentId = apartmentId;
    }

    if (chiefOccupantId) {
      dbQuery.chiefOccupantId = chiefOccupantId;
    }

    if (submittedAt) {
      dbQuery.submittedAt = {
        $gte: new Date(submittedAt.setHours(0, 0, 0, 0)),
        $lte: new Date(submittedAt.setHours(23, 59, 59, 999)),
      };
    }

    if (status) {
      dbQuery.status = status;
    }

    if (subject) {
      dbQuery.subject = { $regex: subject, $options: "i" }; // Case-insensitive search
    }

    const skip = (page - 1) * limit;
    // END : APPLYING FILTERS

    // ----------------------------------------------------------------

    // START : QUERYING THE DATABASE
    const results = await ApplicationModel.find(dbQuery)
      .populate("chiefOccupantId")
      .populate("apartmentId")
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await ApplicationModel.countDocuments(dbQuery);
    // END : QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        applications: results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (e) {
    console.error("Read Many Applications Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
