import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import DependentModel from "../../../entities/dependant/model";

export const DeleteDependent = async (
  dependentID: string
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
        message: ["Dependent not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : DELETE DEPENDENT
    await DependentModel.findByIdAndDelete(dependentID);
    // END : DELETE DEPENDENT

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Dependent deleted successfully"],
    };
  } catch (e) {
    console.error("Delete Dependent Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
