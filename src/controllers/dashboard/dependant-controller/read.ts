import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import DependentModel from "../../../entities/dependant/model";

export const ReadManyDependents = async (
  chiefOccupantId: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!chiefOccupantId || !isValidObjectId(chiefOccupantId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Chief occupant identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const dependents = await DependentModel.find({ chiefOccupantId }).lean();

    if (!dependents.length) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["No dependents found for the given chief occupant"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: dependents,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read Many Dependents Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
