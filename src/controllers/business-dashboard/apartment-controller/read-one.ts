import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ApartmentModel from "../../../entities/apartment/model";

export const ReadOneApartment = async (
  apartmentID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!apartmentID || !isValidObjectId(apartmentID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const apartment = await ApartmentModel.findOne({ _id: apartmentID }).lean();

    if (!apartment) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Apartment not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: apartment,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Apartment Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
