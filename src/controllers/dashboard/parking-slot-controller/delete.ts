import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ParkingModel from "../../../entities/parking/model";

export const DeleteParkingSlot = async (
  slotID: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE SLOT ID
    if (!slotID || !isValidObjectId(slotID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Slot identifier is missing or invalid"],
      };
    }
    // END : VALIDATE SLOT ID

    // ----------------------------------------------------------------

    // START : FETCH CURRENT DETAILS
    const slot = await ParkingModel.findOne({ _id: slotID });

    if (!slot) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Parking slot not found"],
      };
    }

    if (slot.status !== "Available") {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Only slots with 'Available' status can be deleted"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : DELETE PARKING SLOT
    await ParkingModel.findByIdAndDelete(slotID);
    // END : DELETE PARKING SLOT

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Parking slot deleted successfully"],
    };
  } catch (e) {
    console.error("Delete Parking Slot Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
