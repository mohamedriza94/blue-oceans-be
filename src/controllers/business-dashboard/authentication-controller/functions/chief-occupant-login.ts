import { ENUMUserTypes } from "../../../../entities/admin/enums";
import ChiefOccupantModel from "../../../../entities/chief-occupant/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";
import { comparePassword } from "../../../../services/bcrypt/functions";
import { trimInputs } from "../../../../utils/trim-inputs";
import { zodValidate } from "../../../../utils/zod-validation";
import { IAdminLogin } from "../interfaces/login";
import { ZOD_loginSchema } from "../validations/login-zod-schema";
import { GenerateAuthTokens } from "./generate-auth-tokens";

export const ChiefOccupantLogin = async (inputs: IAdminLogin): Promise<IReturnObj> => {
  try {
    // START: PROCESS AND VALIDATE INPUTS
    const trimmedInputs = trimInputs(inputs);

    const validationErrors = zodValidate(ZOD_loginSchema, trimmedInputs);
    if (validationErrors) {
      return validationErrors;
    }
    // END: PROCESS AND VALIDATE INPUTS

    // ----------------------------------------------------------------

    // START: CHECK IF CHIEF OCCUPANT EXISTS & IS ACTIVE
    const chiefOccupant = await ChiefOccupantModel.findOne({
      email: trimmedInputs.email,
    })
      .select("_id email password fullName")
      .lean();

    if (!chiefOccupant) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Account was not found"],
      };
    }
    // END: CHECK IF CHIEF OCCUPANT EXISTS & IS ACTIVE

    // ----------------------------------------------------------------

    // START: VALIDATE PASSWORD
    const passwordIsCorrect = await comparePassword(
      trimmedInputs.password,
      chiefOccupant.password
    );

    if (!passwordIsCorrect) {
      return {
        statusCode: ENUMHttpStatusCode.UNAUTHORIZED,
        message: ["Incorrect Password"],
      };
    }
    // END: VALIDATE PASSWORD

    // ----------------------------------------------------------------

    // START: GENERATE JWT
    const JWT_ValidityDuration = trimmedInputs.rememberMe ? "7d" : "1d";

    const { password, ...chiefOccupantFiltered } = chiefOccupant;

    const jwt = GenerateAuthTokens(
      chiefOccupantFiltered._id.toString(),
      JWT_ValidityDuration,
      ENUMUserTypes.ChiefOccupant
    );
    if (!jwt) {
      return {
        statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
        message: ["Failed to generate authentication tokens"],
      };
    }
    // END: GENERATE JWT

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Logged in successfully"],
      data: { jwt, chiefOccupant: chiefOccupantFiltered },
    };
  } catch (e) {
    console.log("Chief Occupant Login Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
