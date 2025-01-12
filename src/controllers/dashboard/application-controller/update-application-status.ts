import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ApplicationModel from "../../../entities/application/model";

export const UpdateApplicationStatus = async (
  applicationID: string,
  status: "Pending" | "Reviewed" | "Approved" | "Rejected"
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

    // START : UPDATE STATUS
    const updatedApplication = await ApplicationModel.findByIdAndUpdate(
      applicationID,
      { status },
      { new: true }
    ).lean();

    if (!updatedApplication) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Application not found"],
      };
    }
    // END : UPDATE STATUS

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Application status updated successfully"],
      data: updatedApplication,
    };
  } catch (e) {
    console.error("Update Application Status Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
