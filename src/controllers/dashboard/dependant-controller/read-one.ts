import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import DependentModel from "../../../entities/dependant/model";

export const ReadOneDependent = async (
  dependentID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!dependentID || !isValidObjectId(dependentID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const dependent = await DependentModel.findOne({ _id: dependentID })
      .populate("chiefOccupantId", "fullName contactNumber email") // Populates chief occupant details
      .lean();

    if (!dependent) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Dependent not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: dependent,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Dependent Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
