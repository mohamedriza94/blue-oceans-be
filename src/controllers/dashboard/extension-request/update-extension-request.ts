import { isValidObjectId } from "mongoose";
import ExtensionRequestModel from "../../../entities/extension-request/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { IExtensionRequest } from "../../../entities/extension-request/i";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_extensionRequestSchema } from "./utils/zod-schema";
import { getModifiedFields } from "../../../utils/get-modified-fields";

export const UpdateExtensionRequest = async (
  extensionRequestId: string,
  inputs: Partial<IExtensionRequest>
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE ID
    if (!extensionRequestId || !isValidObjectId(extensionRequestId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE ID

    // ----------------------------------------------------------------

    // START : FETCH CURRENT DETAILS
    const extensionRequest = await ExtensionRequestModel.findOne({
      _id: extensionRequestId,
    }).lean();

    if (!extensionRequest || extensionRequest == null) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Extension request was not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : INPUT PROCESSING
    const trimmedInputs: typeof inputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_extensionRequestSchema,
      { ...extensionRequest, ...trimmedInputs }
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT PROCESSING

    // ----------------------------------------------------------------

    // START : GET MODIFIED FIELDS
    const modifiedFields = getModifiedFields(
      { ...extensionRequest, ...trimmedInputs },
      extensionRequest
    );
    // END : GET MODIFIED FIELDS

    // ----------------------------------------------------------------

    // START : PERFORM UPDATE
    if (Object.keys(modifiedFields).length > 0) {
      console.log('modifiedFields', modifiedFields);

      await ExtensionRequestModel.findByIdAndUpdate(
        extensionRequestId,
        modifiedFields,
        {
          new: true,
        }
      );

      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Extension request update successful"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No changes detected"],
      };
    }
    // END : PERFORM UPDATE
  } catch (e) {
    console.log("Update Extension request Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
