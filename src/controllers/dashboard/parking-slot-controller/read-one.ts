import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ParkingModel from "../../../entities/parking/model";

export const ReadOneParkingSlot = async (
  slotID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!slotID || !isValidObjectId(slotID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const parkingSlot = await ParkingModel.findOne({ _id: slotID })
      .populate("buildingId", "buildingName address")
      .lean();

    if (!parkingSlot) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Parking slot not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: parkingSlot,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Parking Slot Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
