import ApartmentModel from "../../../entities/apartment/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IPaginationParams } from "../../../interfaces/pagination";
import { IReturnObj } from "../../../interfaces/return-obj";
import { sanitizeQueryParams } from "../../../utils/sanitize-query-params";

interface IApartmentSearchParams {
  buildingId?: string;
  identification?: string;
}

interface IApartmentFilterParams {
  status?: "Available" | "Occupied" | "Maintenance";
  class?: "Luxury" | "Standard" | "Studio" | "Penthouse" | "Duplex";
}

export interface IApartmentQueryParams
  extends IPaginationParams,
    IApartmentSearchParams,
    IApartmentFilterParams {}

export const ReadManyApartments = async (
  queryParams: IApartmentQueryParams
): Promise<IReturnObj> => {
  try {
    // START : PROCESS PARAMS
    const cleanedParams = sanitizeQueryParams(queryParams);
    const {
      page = 1,
      limit = 10,
      buildingId,
      identification,
      status,
      class: apartmentClass,
    } = cleanedParams as IApartmentQueryParams;
    // END : PROCESS PARAMS

    // ----------------------------------------------------------------

    // START : APPLYING PARAMS
    const dbQuery: any = {};

    // --- FILTER BY BUILDING ID
    if (buildingId) {
      dbQuery.buildingId = buildingId;
    }

    // --- FILTER BY IDENTIFICATION
    if (identification) {
      dbQuery.identification = { $regex: identification, $options: "i" };
    }

    // --- FILTER BY STATUS
    if (status) {
      dbQuery.status = status;
    }

    // --- FILTER BY CLASS
    if (apartmentClass) {
      dbQuery.class = apartmentClass;
    }

    // --- PAGINATION
    const skip = (page - 1) * limit;
    // END : APPLYING PARAMS

    // ----------------------------------------------------------------

    // START : QUERYING THE DATABASE
    const results = await ApartmentModel.find(dbQuery)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await ApartmentModel.countDocuments(dbQuery);
    // END : QUERYING THE DATABASE

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        apartments: results,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (e) {
    console.log("Read Many Apartments Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
