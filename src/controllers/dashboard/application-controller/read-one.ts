import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ApplicationModel from "../../../entities/application/model";

export const ReadOneApplication = async (
  applicationID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!applicationID || !isValidObjectId(applicationID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const application = await ApplicationModel.findOne({ _id: applicationID })
      .populate("chiefOccupantId") // Populate chief occupant fields
      .populate("apartmentId") // Populate apartment fields
      .lean();

    if (!application) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Application not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: application,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Application Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
