import { IApartment } from "../../../entities/apartment/i";
import ApartmentModel from "../../../entities/apartment/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_apartmentSchema } from "./utils/zod-schema";

export const CreateApartment = async (
  inputs: IApartment
): Promise<IReturnObj> => {
  try {
    // START: INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END: INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START: INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_apartmentSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END: INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START: PREVENT DUPLICATION
    const existingApartment = await ApartmentModel.findOne({
      $or: [
        { telephone: trimmedInputs.telephone },
        { identification: trimmedInputs.identification },
      ],
    });

    if (existingApartment) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: [
          `An apartment with the same telephone or identification already exists.`,
        ],
      };
    }
    // END: PREVENT DUPLICATION

    // ----------------------------------------------------------------

    // START : CREATE APARTMENT
    const newApartment = new ApartmentModel(trimmedInputs);
    const newApartmentResult: any = await newApartment.save();

    if (!newApartmentResult) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Failed to create the apartment"],
      };
    }
    // END : CREATE APARTMENT

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Apartment created successfully"],
    };
  } catch (e) {
    console.log("Create Apartment Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
