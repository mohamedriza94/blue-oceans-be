import { generateToken } from "../../../../configurations/jwt";
import { ENUMStaffMemberStatus } from "../../../../entities/admin/staff-member/enum";
import StaffMemberModel from "../../../../entities/admin/staff-member/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";
import { comparePassword } from "../../../../services/bcrypt/functions";
import { trimInputs } from "../../../../utils/trim-inputs";
import { zodValidate } from "../../../../utils/zod-validation";
import { IStaffLogin } from "../interfaces/login";
import { ZOD_staffLoginSchema } from "../validations/staff-login-zod-schema";
import { GenerateAuthTokens } from "./generate-auth-tokens";

export const StaffLogin = async (inputs: IStaffLogin): Promise<IReturnObj> => {
  try {
    // START: PROCESS AND VALIDATE INPUTS
    const trimmedInputs = trimInputs(inputs);

    const validationErrors = zodValidate(ZOD_staffLoginSchema, trimmedInputs);
    if (validationErrors) {
      return validationErrors;
    }
    // END: PROCESS AND VALIDATE INPUTS

    // ----------------------------------------------------------------

    // START: CHECK IF STAFF MEMBER EXISTS & IS ACTIVE
    const staffMember = await StaffMemberModel.findOne({
      email: trimmedInputs.email,
      "deletion.isDeleted": false,
    })
      .select(
        "_id email password fullName avatar roles status twoFactorAuthEnabled"
      )
      .lean();

    if (!staffMember) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Account was not found"],
      };
    }

    if (staffMember.status != ENUMStaffMemberStatus.active) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["This account is not active. Please contact Admin"],
      };
    }
    // END: CHECK IF STAFF MEMBER EXISTS & IS ACTIVE

    // ----------------------------------------------------------------

    // START: VALIDATE PASSWORD
    const passwordIsCorrect = await comparePassword(
      trimmedInputs.password,
      staffMember.password
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

    const { password, ...staffMemberFiltered } = staffMember;

    const jwt = GenerateAuthTokens(
      staffMemberFiltered._id.toString(),
      JWT_ValidityDuration
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
      data: { jwt, staffMember: staffMemberFiltered },
    };
  } catch (e) {
    console.log("Staff Login Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
