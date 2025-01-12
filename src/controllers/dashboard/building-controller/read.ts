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

    // Convert page and limit to numbers
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Page and limit must be valid numbers"],
      };
    }
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
    const skip = (pageNumber - 1) * limitNumber;
    // END : APPLYING PARAMS

    // ----------------------------------------------------------------

    // START : QUERYING THE DATABASE
    const buildings = await BuildingModel.aggregate([
      { $match: dbQuery },
      {
        $lookup: {
          from: "apartments",
          localField: "_id",
          foreignField: "buildingId",
          as: "apartments",
        },
      },
      {
        $addFields: {
          apartmentCount: { $size: "$apartments" },
        },
      },
      {
        $project: {
          apartments: 0,
        },
      },
      { $skip: skip },
      { $limit: limitNumber }, // Ensure this is a number
    ]);

    const totalCount = await BuildingModel.countDocuments(dbQuery);
    // END : QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        buildings,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber),
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
