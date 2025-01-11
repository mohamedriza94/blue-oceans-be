import { sendTransactionalEmail } from "../../../../../configurations/email-api/brevo";
import { TEmailOptions } from "../../../../../configurations/email-api/types";
import { ENUMHttpStatusCode } from "../../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../../interfaces/return-obj";
import { trimInputs } from "../../../../../utils/trim-inputs";
import { zodValidate } from "../../../../../utils/zod-validation";
import { IRequestOTP } from "../../interfaces/i";
import { GenerateOTP } from "../generate-otp";
import { ZOD_requestOTPSchema } from "./zod-schema";

export const RequestOTP = async (
  inputs: Partial<IRequestOTP>
): Promise<IReturnObj> => {
  try {
    // START: GET AND VALIDATE INPUTS
    const trimmedInputs: Partial<IRequestOTP> = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_requestOTPSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END: GET AND VALIDATE INPUTS

    // ----------------------------------------------------------------

    // START: GET OTP
    const otpDigitCount = trimmedInputs.otpDigitCount || 6;
    const otp = await GenerateOTP(trimmedInputs, otpDigitCount, 30);

    if (otp.statusCode != ENUMHttpStatusCode.OK) {
      const { data, ...newOtp } = otp;

      return newOtp;
    }
    // END: GET OTP

    // ----------------------------------------------------------------

    // START: SEND OTP IN EMAIL
    if (trimmedInputs.email) {
      const emailOptions: TEmailOptions = {
        to: [{ email: trimmedInputs.email }],
        subject: "One Time Pass Code",
        templateType: "brevo",
        templateData: {
          id: "7",
          params: {
            email: trimmedInputs.email,
            otp: otp.data,
            title: trimmedInputs.mail?.title || "OTP",
            text: trimmedInputs.mail?.text || "Your OTP",
            validityDurationInMinutes: `${trimmedInputs.validityDurationInMinutes} Minutes`,
          },
        },
      };
      sendTransactionalEmail(emailOptions);
    }
    // END: SEND OTP IN EMAIL

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["OTP Sent"],
    };
  } catch (e) {
    console.log("Request OTP Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
