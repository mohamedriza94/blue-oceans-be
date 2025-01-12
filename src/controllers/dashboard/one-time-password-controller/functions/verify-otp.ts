import OneTimePasswordModel from "../../../../entities/otp/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";
import { comparePassword } from "../../../../services/bcrypt/functions";
import { IVerifyOTP } from "../interfaces/i";

export const VerifyOTP = async (
  inputs: Partial<IVerifyOTP>
): Promise<IReturnObj> => {
  try {
    // START: DESTRUCTURE INPUTS
    const {
      userID,
      email,
      phoneNumber,
      otp,
    } = inputs;

    if ((!userID && !email && !phoneNumber) || !otp) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["User ID, Email, Phone Number, or OTP is missing"],
      };
    }
    // END: DESTRUCTURE INPUTS

    // ----------------------------------------------------------------

    // START: RETRIEVE AND VERIFY OTP FROM DB
    const query: any = {
      $or: [{ userID: userID }, { email: email }, { phoneNumber: phoneNumber }],
    };

    const oneTimePasswordDoc = await OneTimePasswordModel.findOne(query).select(
      "_id otp createdAt validityDurationInMinutes"
    );

    if (!oneTimePasswordDoc) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["OTP not found"],
      };
    }

    const oneTimePasswordDocObject = oneTimePasswordDoc.toObject();

    const isCorrectOTP = await comparePassword(
      otp,
      oneTimePasswordDocObject.otp
    );

    if (!isCorrectOTP) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["OTP is incorrect"],
      };
    }
    // END: RETRIEVE AND VERIFY OTP FROM DB

    // ----------------------------------------------------------------

    // START: CHECK IF OTP IS EXPIRED
    const otpCreatedAt = oneTimePasswordDocObject.createdAt.getTime();
    const now = Date.now();

    if (now - otpCreatedAt > oneTimePasswordDocObject.validityDurationInMinutes * 60 * 1000) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["OTP is expired"],
      };
    }
    // END: CHECK IF OTP IS EXPIRED

    // ----------------------------------------------------------------

    // START: DELETE OTP AFTER VERIFIED
    await OneTimePasswordModel.deleteOne({ _id: oneTimePasswordDoc._id });
    // END: DELETE OTP AFTER VERIFIED

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["OTP verified successfully"],
    };
  } catch (e) {
    console.log("Verify OTP Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
