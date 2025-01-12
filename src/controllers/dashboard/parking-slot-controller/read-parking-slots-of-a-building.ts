import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ParkingModel from "../../../entities/parking/model";

export const ReadParkingSlotsOfBuilding = async (
  buildingId: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!buildingId || !isValidObjectId(buildingId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Building identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH PARKING SLOTS
    const parkingSlots = await ParkingModel.find({ buildingId }).lean();

    if (!parkingSlots.length) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["No parking slots found for the given building"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: parkingSlots,
    };
    // END : FETCH PARKING SLOTS
  } catch (e) {
    console.error("Read Parking Slots Of Building Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
