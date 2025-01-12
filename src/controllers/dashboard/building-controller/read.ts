import BuildingModel from "../../../entities/building/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IBuildingSearchParams {
  buildingName?: string;
  address?: string;
}

export interface IBuildingQueryParams
  extends IPaginationParams,
    IBuildingSearchParams {}

export const ReadManyBuildings = async (
  queryParams: IBuildingQueryParams
): Promise<IReturnObj> => {
  try {
    // START : PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      buildingName,
      address,
    } = cleanedParams as IBuildingQueryParams;
    // END : PROCESS PARAMS

    // ----------------------------------------------------------------

    // START : APPLYING PARAMS
    const dbQuery: any = {};

    // --- SEARCH BY BUILDING NAME
    if (buildingName) {
      dbQuery.buildingName = { $regex: buildingName, $options: "i" };
    }

    // --- SEARCH BY ADDRESS
    if (address) {
      dbQuery.address = { $regex: address, $options: "i" };
    }

    // --- PAGINATION
    const skip = (page - 1) * limit;
    // END : APPLYING PARAMS

    // ----------------------------------------------------------------

    // START : QUERYING THE DATABASE
    const results = await BuildingModel.find(dbQuery)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await BuildingModel.countDocuments(dbQuery);
    // END : QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        buildings: results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (e) {
    console.log("Read Many Buildings Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
