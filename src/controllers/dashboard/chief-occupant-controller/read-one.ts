import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";

export const ReadOneChiefOccupant = async (
  occupantID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!occupantID || !isValidObjectId(occupantID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const occupant = await ChiefOccupantModel.findOne({ _id: occupantID })
      .populate("apartmentId", "description class status")
      .lean();

    if (!occupant) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Chief occupant not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: occupant,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Chief Occupant Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
