import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ExtensionRequestModel from "../../../entities/extension-request/model";

export const ReadOneExtensionRequest = async (
  extensionRequestId: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!extensionRequestId || !isValidObjectId(extensionRequestId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const extensionRequest = await ExtensionRequestModel.findOne({
      _id: extensionRequestId,
    })
      .populate({
        path: "leaseId",
        populate: {
          path: "chiefOccupantId",
        },
      })
      .lean()
      .exec();

    if (!extensionRequest) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Extension request not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: extensionRequest,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Extension request Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
