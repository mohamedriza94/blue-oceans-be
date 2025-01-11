import { ENUMUserTypes } from "../../../../entities/admin/enums";
import AdminModel from "../../../../entities/admin/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";
import { comparePassword } from "../../../../services/bcrypt/functions";
import { trimInputs } from "../../../../utils/trim-inputs";
import { zodValidate } from "../../../../utils/zod-validation";
import { IAdminLogin } from "../interfaces/login";
import { ZOD_loginSchema } from "../validations/login-zod-schema";
import { GenerateAuthTokens } from "./generate-auth-tokens";

export const AdminLogin = async (inputs: IAdminLogin): Promise<IReturnObj> => {
  try {
    // START: PROCESS AND VALIDATE INPUTS
    const trimmedInputs = trimInputs(inputs);

    const validationErrors = zodValidate(ZOD_loginSchema, trimmedInputs);
    if (validationErrors) {
      return validationErrors;
    }
    // END: PROCESS AND VALIDATE INPUTS

    // ----------------------------------------------------------------

    // START: CHECK IF ADMIN EXISTS & IS ACTIVE
    const admin = await AdminModel.findOne({
      email: trimmedInputs.email,
    })
      .select("_id email password fullName")
      .lean();

    if (!admin) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Account was not found"],
      };
    }
    // END: CHECK IF ADMIN EXISTS & IS ACTIVE

    // ----------------------------------------------------------------

    // START: VALIDATE PASSWORD
    const passwordIsCorrect = await comparePassword(
      trimmedInputs.password,
      admin.password
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

    const { password, ...adminFiltered } = admin;

    const jwt = GenerateAuthTokens(
      adminFiltered._id.toString(),
      JWT_ValidityDuration,
      ENUMUserTypes.Admin
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
      data: { jwt, admin: adminFiltered },
    };
  } catch (e) {
    console.log("Admin Login Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
