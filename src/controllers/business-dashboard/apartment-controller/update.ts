import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ApartmentModel from "../../../entities/apartment/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { getModifiedFields } from "../../../utils/get-modified-fields";
import { ZOD_apartmentSchema } from "./utils/zod-schema";
import { IApartment } from "../../../entities/apartment/i";

export const UpdateApartment = async (
  apartmentID: string,
  inputs: Partial<IApartment>
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE APARTMENT ID
    if (!apartmentID || !isValidObjectId(apartmentID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE APARTMENT ID

    // ----------------------------------------------------------------

    // START : FETCH CURRENT DETAILS
    const apartment = await ApartmentModel.findOne({ _id: apartmentID });

    if (!apartment) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Apartment was not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : INPUT PROCESSING
    if (inputs.buildingId) {
      delete inputs.buildingId; // Prevent updating the buildingId directly
    }

    const trimmedInputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_apartmentSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT PROCESSING

    // ----------------------------------------------------------------

    // START : GET MODIFIED FIELDS
    const modifiedFields = getModifiedFields(
      trimmedInputs,
      apartment.toObject()
    );
    // END : GET MODIFIED FIELDS

    // ----------------------------------------------------------------

    // START : PERFORM UPDATE
    if (Object.keys(modifiedFields).length > 0) {
      await ApartmentModel.findByIdAndUpdate(apartmentID, modifiedFields, {
        new: true,
      });

      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Apartment update successful"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No changes detected"],
      };
    }
    // END : PERFORM UPDATE
  } catch (e) {
    console.log("Update Apartment Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
