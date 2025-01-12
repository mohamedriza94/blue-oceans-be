import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ApplicationModel from "../../../entities/application/model";

export const DeleteApplication = async (
  applicationID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE APPLICATION ID
    if (!applicationID || !isValidObjectId(applicationID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Application identifier is missing or invalid"],
      };
    }
    // END : VALIDATE APPLICATION ID

    // ----------------------------------------------------------------

    // START : DELETE APPLICATION
    const result = await ApplicationModel.findByIdAndDelete(applicationID);

    if (!result) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Application not found"],
      };
    }
    // END : DELETE APPLICATION

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Application deleted successfully"],
    };
  } catch (e) {
    console.error("Delete Application Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
