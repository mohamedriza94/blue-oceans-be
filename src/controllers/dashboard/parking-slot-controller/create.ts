import { IParking } from "../../../entities/parking/i";
import ParkingModel from "../../../entities/parking/model";
import BuildingModel from "../../../entities/building/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { getAcronym } from "../../../utils/get-acronym";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_parkingSchema } from "./utils/zod-schema";

export const CreateParkingSlot = async (
  inputs: IParking
): Promise<IReturnObj> => {
  try {
    // START: INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END: INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START: INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_parkingSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END: INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START : VALIDATE BUILDING EXISTENCE
    const building: any = await BuildingModel.findOne({
      _id: trimmedInputs.buildingId,
    });

    if (!building) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Building not found"],
      };
    }

    const buildingAcronym = getAcronym(building.buildingName);
    // END : VALIDATE BUILDING EXISTENCE

    // ----------------------------------------------------------------

    // START : GET LAST PARKING SLOT IN SEQUENCE
    const lastSlot = await ParkingModel.aggregate([
      { $match: { buildingId: building._id } },
      {
        $project: {
          slotNumber: 1,
          numericPart: {
            $toInt: {
              $arrayElemAt: [{ $split: ["$slotNumber", "-Slot-"] }, 1],
            },
          },
        },
      },
      { $sort: { numericPart: -1 } }, // Sort descending by numeric part
      { $limit: 1 }, // Get only the last slot
    ]).exec();

    let nextSlotNumber = 1; // Default to 1 if no slots exist
    if (lastSlot.length > 0 && lastSlot[0].numericPart) {
      nextSlotNumber = lastSlot[0].numericPart + 1; // Increment last sequence number
    }
    // END : GET LAST PARKING SLOT IN SEQUENCE

    // ----------------------------------------------------------------

    // START : CHECK FOR DUPLICATE SLOT
    const existingSlot = await ParkingModel.findOne({
      buildingId: building._id.toString(),
      slotNumber: `${buildingAcronym}-Slot-${nextSlotNumber}`,
    });

    if (existingSlot) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["A parking slot with the same slot number already exists."],
      };
    }
    // END : CHECK FOR DUPLICATE SLOT

    // ----------------------------------------------------------------

    // START : CREATE NEW PARKING SLOT
    const newParkingSlot = new ParkingModel({
      buildingId: building._id.toString(),
      slotNumber: `${buildingAcronym}-Slot-${nextSlotNumber}`,
      status: "Available",
    });

    await newParkingSlot.save();
    // END : CREATE NEW PARKING SLOT

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Parking slot created successfully"],
      data: newParkingSlot,
    };
  } catch (e) {
    console.error("Create Parking Slot Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
