import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import ParkingModel from "../../../entities/parking/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { getModifiedFields } from "../../../utils/get-modified-fields";

export const UpdateParkingSlotStatus = async (
  slotID: string,
  inputs: { status: "Available" | "Occupied" }
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
        message: ["Parking slot was not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : INPUT PROCESSING
    const trimmedInputs = trimInputs(inputs);

    if (!["Available", "Occupied"].includes(trimmedInputs.status)) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Invalid status value"],
      };
    }
    // END : INPUT PROCESSING

    // ----------------------------------------------------------------

    // START : GET MODIFIED FIELDS
    const modifiedFields = getModifiedFields(trimmedInputs, slot.toObject());
    // END : GET MODIFIED FIELDS

    // ----------------------------------------------------------------

    // START : PERFORM UPDATE
    if (Object.keys(modifiedFields).length > 0) {
      await ParkingModel.findByIdAndUpdate(slotID, modifiedFields, {
        new: true,
      });

      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Parking slot status update successful"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No changes detected"],
      };
    }
    // END : PERFORM UPDATE
  } catch (e) {
    console.log("Update Parking Slot Status Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
