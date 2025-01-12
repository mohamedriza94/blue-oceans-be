import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import BuildingModel from "../../../entities/building/model";
import ParkingModel from "../../../entities/parking/model";

export const ReadOneBuilding = async (
  buildingID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!buildingID || !isValidObjectId(buildingID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const building = await BuildingModel.findOne({ _id: buildingID }).lean();

    if (!building) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Building not found"],
      };
    }

    const parkingSlots = await ParkingModel.find({
      buildingId: buildingID,
    }).lean();

    // Combine building data with parking slots
    const buildingWithSlots = {
      buildingData: building,
      parkingSlots: parkingSlots,
    };

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: buildingWithSlots,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Building Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
