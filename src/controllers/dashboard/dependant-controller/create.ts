import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import DependentModel from "../../../entities/dependant/model";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_dependentSchema } from "./utils/zod-schema";
import { IDependent } from "../../../entities/dependant/i";

export const CreateDependent = async (
  inputs: Omit<IDependent, "_id">
): Promise<IReturnObj> => {
  try {
    // START : INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END : INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START : INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_dependentSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START : CHIEF OCCUPANT VALIDATION
    const chiefOccupantExists = await ChiefOccupantModel.findOne({
      _id: trimmedInputs.chiefOccupantId,
    });

    if (!chiefOccupantExists) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Chief Occupant not found"],
      };
    }
    // END : CHIEF OCCUPANT VALIDATION

    // ----------------------------------------------------------------

    // START : CREATE DEPENDENT
    const newDependent = new DependentModel({
      ...trimmedInputs,
      dateOfBirth: new Date(trimmedInputs.dateOfBirth),
    });

    await newDependent.save();
    // END : CREATE DEPENDENT

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Dependent created successfully"],
    };
  } catch (e) {
    console.error("Create Dependent Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
