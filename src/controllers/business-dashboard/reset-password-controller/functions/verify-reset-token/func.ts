import { verifyToken } from "../../../../../configurations/jwt";
import AdminModel from "../../../../../entities/admin/model";
import { ENUMHttpStatusCode } from "../../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../../interfaces/return-obj";
import { trimInputs } from "../../../../../utils/trim-inputs";
import { zodValidate } from "../../../../../utils/zod-validation";
import { IVerifyResetToken } from "../../interfaces/i";
import { ZOD_verifyTokenSchema } from "./zod-schema";

export const VerifyResetToken = async (
  inputs: IVerifyResetToken
): Promise<IReturnObj> => {
  try {
    // START: GET AND VALIDATE INPUTS
    const trimmedInputs = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_verifyTokenSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END: GET AND VALIDATE INPUTS

    // ----------------------------------------------------------------

    // START: VERIFY TOKEN
    const decodedData = await verifyToken(trimmedInputs.token);

    if (!decodedData || !("userId" in decodedData)) {
      return {
        statusCode: ENUMHttpStatusCode.FORBIDDEN,
        message: ["Token verification failed. Get another reset link"],
      };
    }
    // END: VERIFY TOKEN

    // ----------------------------------------------------------------

    // START: VERIFY USER
    const { userId } = decodedData;

    const account = await AdminModel.findOne({
      _id: userId,
    }).select("_id email fullName");

    if (!account) {
      return {
        statusCode: ENUMHttpStatusCode.CONFLICT,
        message: ["Account not found"],
      };
    }

    const accountObject = account.toObject();

    if (!inputs.returnUserID) {
      delete accountObject._id;
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Token Verified. Please enter your new password"],
      data: {
        account: accountObject,
        token: trimmedInputs.token,
      },
    };
    // END: VERIFY USER
  } catch (e) {
    console.log("Verify Reset Token Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
