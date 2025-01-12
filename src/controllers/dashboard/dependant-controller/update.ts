import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import DependentModel from "../../../entities/dependant/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { getModifiedFields } from "../../../utils/get-modified-fields";
import { ZOD_dependentSchema } from "./utils/zod-schema";
import { IDependent } from "../../../entities/dependant/i";

export const UpdateDependent = async (
  dependentID: string,
  inputs: Partial<IDependent>
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE DEPENDENT ID
    if (!dependentID || !isValidObjectId(dependentID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Dependent identifier is missing or invalid"],
      };
    }
    // END : VALIDATE DEPENDENT ID

    // ----------------------------------------------------------------

    // START : FETCH CURRENT DETAILS
    const dependent = await DependentModel.findOne({ _id: dependentID });

    if (!dependent) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Dependent was not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : INPUT PROCESSING
    const trimmedInputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_dependentSchema,
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
      dependent.toObject()
    );
    // END : GET MODIFIED FIELDS

    // ----------------------------------------------------------------

    // START : PERFORM UPDATE
    if (Object.keys(modifiedFields).length > 0) {
      await DependentModel.findByIdAndUpdate(dependentID, modifiedFields, {
        new: true,
      });

      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Dependent update successful"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No changes detected"],
      };
    }
    // END : PERFORM UPDATE
  } catch (e) {
    console.error("Update Dependent Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
