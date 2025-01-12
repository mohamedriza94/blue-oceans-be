import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { getModifiedFields } from "../../../utils/get-modified-fields";
import { ZOD_chiefOccupantSchema } from "./utils/zod-schema";
import { IChiefOccupant } from "../../../entities/chief-occupant/i";

export const UpdateChiefOccupant = async (
  occupantID: string,
  inputs: Partial<Omit<IChiefOccupant, "password">>
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE OCCUPANT ID
    if (!occupantID || !isValidObjectId(occupantID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE OCCUPANT ID

    // ----------------------------------------------------------------

    // START : FETCH CURRENT DETAILS
    const occupant = await ChiefOccupantModel.findOne({ _id: occupantID });

    if (!occupant) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Chief occupant was not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : INPUT PROCESSING
    const trimmedInputs = trimInputs(inputs);

    // Ensure password cannot be updated
    if ("password" in trimmedInputs) {
      delete trimmedInputs.password;
    }

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_chiefOccupantSchema,
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
      occupant.toObject()
    );
    // END : GET MODIFIED FIELDS

    // ----------------------------------------------------------------

    // START : PERFORM UPDATE
    if (Object.keys(modifiedFields).length > 0) {
      await ChiefOccupantModel.findByIdAndUpdate(occupantID, modifiedFields, {
        new: true,
      });

      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Chief occupant update successful"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No changes detected"],
      };
    }
    // END : PERFORM UPDATE
  } catch (e) {
    console.log("Update Chief Occupant Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
