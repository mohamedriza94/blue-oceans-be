import OneTimePasswordModel from "../../../../entities/otp/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";
import { hashPassword } from "../../../../services/bcrypt/functions";
import { generateRandomNumber } from "../../../../utils/generate-random-number";
import { IGenerateOTP } from "../interfaces/i";

export const GenerateOTP = async (
  inputs: Partial<IGenerateOTP>,
  otpDigitCount: number = 6,
  timeoutInSeconds: number = 10
): Promise<IReturnObj> => {
  try {
    // START: CHECK TIMEOUT
    const currentTime = Date.now();
    const timeoutLimit = timeoutInSeconds * 1000;

    const existingOtp = await OneTimePasswordModel.findOne({
      $or: [
        { userID: inputs.userID },
        { email: inputs.email },
        { phoneNumber: inputs.phoneNumber },
      ],
    })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();

    if (
      existingOtp &&
      currentTime - existingOtp.createdAt.getTime() < timeoutLimit
    ) {
      const remainingTime = Math.ceil(
        (timeoutLimit - (currentTime - existingOtp.createdAt.getTime())) / 1000
      );

      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: [
          `Please wait ${remainingTime} seconds before requesting your next OTP.`,
        ],
      };
    }
    // END: CHECK TIMEOUT

    // ----------------------------------------------------------------

    // START: CHECK IF AN OTP EXISTS FOR THE SAME USER
    await OneTimePasswordModel.deleteMany({
      $or: [
        { userID: inputs.userID },
        { email: inputs.email },
        { phoneNumber: inputs.phoneNumber },
      ],
    });
    // END: CHECK IF AN OTP EXISTS FOR THE SAME USER

    // ----------------------------------------------------------------

    // START: GENERATE OTP
    const otp = generateRandomNumber(otpDigitCount);

    const hashedOTP = await hashPassword(otp);

    const newOTP = new OneTimePasswordModel({
      userID: inputs?.userID,
      email: inputs?.email,
      phoneNumber: inputs?.phoneNumber,
      otp: hashedOTP,
      validityDurationInMinutes: Math.ceil(timeoutInSeconds / 60),
      createdAt: Date.now(),
    });

    await newOTP.save();

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["OTP Sent!"],
      data: otp,
    };
    // END: GENERATE OTP
  } catch (e) {
    console.log("Generate OTP Error", e);

    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
