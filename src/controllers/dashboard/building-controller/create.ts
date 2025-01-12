import { IBuilding } from "../../../entities/building/i";
import BuildingModel from "../../../entities/building/model";
import ParkingModel from "../../../entities/parking/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { getAcronym } from "../../../utils/get-acronym";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_buildingSchema } from "./utils/zod-schema";

export const CreateBuilding = async (
  inputs: IBuilding
): Promise<IReturnObj> => {
  try {
    // START: INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END: INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START: INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_buildingSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END: INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START: PREVENT DUPLICATION
    const existingBuilding = await BuildingModel.findOne({
      $or: [
        { address: trimmedInputs.address },
        { telephone: trimmedInputs.telephone },
      ],
    });

    if (existingBuilding) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: [
          `A building with the same Address or Telephone No. already exists.`,
        ],
      };
    }
    // END: PREVENT DUPLICATION

    // ----------------------------------------------------------------

    // START : CREATE BUILDING
    const newBuilding = new BuildingModel({
      ...trimmedInputs,
    });
    const newBuildingResult: any = await newBuilding.save();

    if (!newBuildingResult) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Failed to create the building"],
      };
    }

    // END : CREATE BUILDING

    // ----------------------------------------------------------------

    // START: CREATE PARKING SLOTS
    const parkingSlotsToCreate = [];
    const buildingNameAcronym = getAcronym(trimmedInputs.buildingName);
    for (let i = 1; i <= trimmedInputs.parkingSlots; i++) {
      parkingSlotsToCreate.push({
        buildingId: newBuildingResult._id.toString(),
        slotNumber: `${buildingNameAcronym}-Slot-${i}`,
        status: "Available",
      });
    }

    try {
      await ParkingModel.insertMany(parkingSlotsToCreate);
    } catch (error) {
      console.error("Failed to create parking slots:", error);
      return {
        statusCode: ENUMHttpStatusCode.CREATED,
        message: ["Building created, but parking slots could not be created."],
      };
    }
    // END: CREATE PARKING SLOTS

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Building and parking slots created successfully"],
    };
  } catch (e) {
    console.log("Create Building Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
