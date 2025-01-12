import { sendTransactionalEmail } from "../../../../../configurations/email-api/brevo";
import { TEmailOptions } from "../../../../../configurations/email-api/types";
import { BusinessDashboardPaths } from "../../../../../constants/frontend-paths/business-dashboard-paths";
import { ENUMHttpStatusCode } from "../../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../../interfaces/return-obj";
import { BlacklistToken } from "../../../blacklisted-token-controller/functions/blacklist-token";
import { IsTokenBlacklisted } from "../../../blacklisted-token-controller/functions/is-token-blacklisted";
import { IResetPasswordViaLink } from "../../interfaces/i";
import { SavePassword } from "../save-password/func";
import { VerifyResetToken } from "../verify-reset-token/func";

export const ResetPasswordViaLink = async (
  inputs: IResetPasswordViaLink
): Promise<IReturnObj> => {
  try {
    // START: VERIFY TOKEN
    const isTokenBlacklisted = await IsTokenBlacklisted(inputs.token);
    if (isTokenBlacklisted) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["This link has already been used. Please get a new one."],
      };
    }

    const verifyTokenResult = await VerifyResetToken({
      token: inputs.token,
      returnUserID: true,
    });
    if (verifyTokenResult.statusCode != ENUMHttpStatusCode.OK) {
      return verifyTokenResult;
    }
    // END: VERIFY TOKEN

    // ----------------------------------------------------------------

    // START: UPDATE PASSWORD
    if (!verifyTokenResult.data || !("account" in verifyTokenResult.data)) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Account data is missing."],
      };
    }
    const account: any = verifyTokenResult.data.account; // account structure is IStaffMember
    const payload = {
      userID: account._id.toString(),
      email: account.email,
      password: inputs.password,
      confirmedPassword: inputs.confirmedPassword,
    };
    const savePasswordResult = await SavePassword(payload);

    if (savePasswordResult.statusCode != ENUMHttpStatusCode.OK) {
      return savePasswordResult;
    }
    // END: UPDATE PASSWORD

    // ----------------------------------------------------------------

    // START: SEND PASSWORD RESET SUCCESS EMAIL
    const firstName = account.fullName?.split(" ")[0] || "there";
    const emailOptions: TEmailOptions = {
      to: [{ email: account.email, name: firstName }],
      subject: "Password Updated",
      templateType: "brevo",
      templateData: {
        id: "6",
        params: {
          firstName: firstName,
          loginPageLink: BusinessDashboardPaths.LOGIN,
          email: account.email,
        },
      },
    };
    sendTransactionalEmail(emailOptions);
    // END: SEND PASSWORD RESET SUCCESS EMAIL

    BlacklistToken(inputs.token);

    return savePasswordResult;
    // END: UPDATE PASSWORD
  } catch (e) {
    console.log("Reset Password Via Link Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
