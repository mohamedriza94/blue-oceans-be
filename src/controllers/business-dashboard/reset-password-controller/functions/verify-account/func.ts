import { sendTransactionalEmail } from "../../../../../configurations/email-api/brevo";
import { TEmailOptions } from "../../../../../configurations/email-api/types";
import { generateToken } from "../../../../../configurations/jwt";
import { BusinessDashboardPaths } from "../../../../../constants/frontend-paths/business-dashboard-paths";
import { ENUMStaffMemberStatus } from "../../../../../entities/admin/staff-member/enum";
import StaffMemberModel from "../../../../../entities/admin/staff-member/model";
import { ENUMHttpStatusCode } from "../../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../../interfaces/return-obj";
import { envData } from "../../../../../constants/env-data";
import { generateFrontendLink } from "../../../../../utils/generate-frontend-link";
import { getValidityPeriodInWords } from "../../../../../utils/get-validity-period-in-words";
import { trimInputs } from "../../../../../utils/trim-inputs";
import { zodValidate } from "../../../../../utils/zod-validation";
import { IVerifyAccount } from "../../interfaces/i";
import { ZOD_verifyAccountSchema } from "./zod-schema";

export const VerifyAccount = async (
  inputs: IVerifyAccount
): Promise<IReturnObj> => {
  try {
    // START: GET AND VALIDATE INPUTS
    const trimmedInputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_verifyAccountSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END: GET AND VALIDATE INPUTS

    // ----------------------------------------------------------------

    // START: VERIFY ACCOUNT
    const account = await StaffMemberModel.findOne({
      email: trimmedInputs.email,
      "deletion.isDeleted": false,
    }).select("-password");

    if (!account) {
      return {
        statusCode: ENUMHttpStatusCode.CONFLICT,
        message: ["Account not found"],
      };
    }

    if (account.status != ENUMStaffMemberStatus.active) {
      return {
        statusCode: ENUMHttpStatusCode.CONFLICT,
        message: ["Account is not active. Please contact Admin"],
      };
    }
    // END: VERIFY ACCOUNT

    // ----------------------------------------------------------------

    // START: GENERATE RESET PASSWORD JWT
    const JWT_ValidityDuration = "15m";

    const accountObject = account.toObject();

    const jwt = generateToken(
      { userId: accountObject._id },
      JWT_ValidityDuration
    );
    if (!jwt || typeof jwt !== "string") {
      return {
        statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
        message: ["Failed to generate authentication token"],
      };
    }
    // END: GENERATE RESET PASSWORD JWT

    // ----------------------------------------------------------------

    // START: GENERATE FRONTEND URL
    const resetPasswordLink = generateFrontendLink(
      "",
      BusinessDashboardPaths.RESET_PASSWORD,
      { token: jwt }
    );
    // END: GENERATE FRONTEND URL

    // ----------------------------------------------------------------

    // START: SEND RESET LINK EMAIL
    const firstName = account.fullName?.split(" ")[0] || "there";
    const JWT_ValidityDuration_inWords =
      getValidityPeriodInWords(JWT_ValidityDuration);
    const emailOptions: TEmailOptions = {
      to: [{ email: account.email, name: firstName }],
      subject: "Reset Password",
      templateType: "brevo",
      templateData: {
        id: "5",
        params: {
          firstName: firstName,
          resetPasswordLink: resetPasswordLink,
          linkValidityPeriod: JWT_ValidityDuration_inWords,
          email: trimmedInputs.email,
        },
      },
    };

    const resetLinkEmailSent = await sendTransactionalEmail(emailOptions);

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["A Password Reset Link has been sent to your email"],
      data: {
        resetLinkEmailSent: resetLinkEmailSent,
        linkValidityPeriod: JWT_ValidityDuration_inWords,
      },
    };
    // END: SEND RESET LINK EMAIL
  } catch (e) {
    console.log("Verify Account Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
