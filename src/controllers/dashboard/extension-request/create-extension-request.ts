import ExtensionRequestModel from "../../../entities/extension-request/model";
import LeaseModel from "../../../entities/lease/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IExtensionRequest } from "../../../entities/extension-request/i";
import { IReturnObj } from "../../../interfaces/return-obj";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_extensionRequestSchema } from "./utils/zod-schema";
import { AddNotification } from "../../../services/notifications/add-notification";

export const CreateExtensionRequest = async (
  inputs: IExtensionRequest
): Promise<IReturnObj> => {
  try {
    // START : INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END : INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START : INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_extensionRequestSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START : CHECK IF LEASE EXISTS
    const leaseExists = await LeaseModel.exists({ _id: trimmedInputs.leaseId });
    if (!leaseExists) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Lease not found"],
      };
    }
    // END : CHECK IF LEASE EXISTS

    // ----------------------------------------------------------------

    // START : CHECK PENDING EXTENSION REQUEST
    const pendingRequest = await ExtensionRequestModel.exists({
      leaseId: trimmedInputs.leaseId,
      status: "Pending"
    });

    if (pendingRequest) {
      return {
        statusCode: ENUMHttpStatusCode.CONFLICT,
        message: ["An extension request for this lease is already pending"],
      };
    }
    // END : CHECK PENDING EXTENSION REQUEST

    // ----------------------------------------------------------------

    // START : CREATE EXTENSION REQUEST
    const newExtensionRequest = new ExtensionRequestModel(trimmedInputs);

    const result = await newExtensionRequest.save();

    const resultObj = result.toObject();
    // END : CREATE EXTENSION REQUEST

    // Log notification
    await AddNotification({
      status: "unread",
      title: "Extension Requested",
      description: `Extension has been request for lease #${trimmedInputs.leaseId}`,
      relatedEntityId: resultObj._id!.toString(),
      link: "test",
      icon: "RiFileEditLine",
    });

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Extension request created successfully"],
      data: result.toObject(),
    };
  } catch (e) {
    console.error("Create Extension Request Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
