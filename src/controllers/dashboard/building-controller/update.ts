import { isValidObjectId } from "mongoose";
import { IBuilding } from "../../../entities/building/i";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import BuildingModel from "../../../entities/building/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_buildingSchema } from "./utils/zod-schema";
import { getModifiedFields } from "../../../utils/get-modified-fields";

export const UpdateBuilding = async (
  buildingID: string,
  inputs: Partial<IBuilding>
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE BUILDING ID
    if (!buildingID || !isValidObjectId(buildingID)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE BUILDING ID

    // ----------------------------------------------------------------

    // START : FETCH CURRENT DETAILS
    const building = await BuildingModel.findOne({ _id: buildingID });

    if (!building || building == null) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Building was not found"],
      };
    }
    // END : FETCH CURRENT DETAILS

    // ----------------------------------------------------------------

    // START : INPUT PROCESSING
    if (inputs.parkingSlots) {
      delete inputs.parkingSlots; // Prevent updates to parking slots count directly here
    }

    const trimmedInputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_buildingSchema,
      { ...trimmedInputs, parkingSlots: building.parkingSlots }
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT PROCESSING

    // ----------------------------------------------------------------

    // START : GET MODIFIED FIELDS
    const modifiedFields = getModifiedFields(
      { ...trimmedInputs, parkingSlots: building.parkingSlots },
      building.toObject()
    );
    // END : GET MODIFIED FIELDS

    // ----------------------------------------------------------------

    // START : PERFORM UPDATE
    if (Object.keys(modifiedFields).length > 0) {
      console.log('modifiedFields', modifiedFields);
      await BuildingModel.findByIdAndUpdate(buildingID, modifiedFields, {
        new: true,
      });

      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Building update successful"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No changes detected"],
      };
    }
    // END : PERFORM UPDATE
  } catch (e) {
    console.log("Update Building Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
