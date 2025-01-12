import { IApplication } from "../../../entities/application/i";
import ApplicationModel from "../../../entities/application/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_applicationSchema } from "./utils/zod-schema";

export const CreateApplication = async (
  inputs: IApplication
): Promise<IReturnObj> => {
  try {
    const trimmedInputs: typeof inputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_applicationSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }

    // Check for existing pending application for the same chief occupant and apartment
    const existingApplication = await ApplicationModel.findOne({
      chiefOccupantId: trimmedInputs.chiefOccupantId,
      apartmentId: trimmedInputs.apartmentId,
      status: "Pending",
    });

    if (existingApplication) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: [
          "A pending application already exists for this apartment and chief occupant.",
        ],
      };
    }

    const newApplication = new ApplicationModel(trimmedInputs);
    const newApplicationResult: any = await newApplication.save();

    if (!newApplicationResult) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Failed to create the application"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Application created successfully"],
    };
  } catch (e) {
    console.log("Create Application Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
