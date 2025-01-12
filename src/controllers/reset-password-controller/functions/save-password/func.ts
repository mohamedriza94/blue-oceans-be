import AdminModel from "../../../../../entities/admin/model";
import { ENUMHttpStatusCode } from "../../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../../interfaces/return-obj";
import {
  comparePassword,
  hashPassword,
} from "../../../../../services/bcrypt/functions";
import { trimInputs } from "../../../../../utils/trim-inputs";
import { zodValidate } from "../../../../../utils/zod-validation";
import { ISavePassword } from "../../interfaces/i";
import { ZOD_savePasswordSchema } from "./zod-schema";

export const SavePassword = async (
  inputs: ISavePassword
): Promise<IReturnObj> => {
  try {
    // START: GET AND VALIDATE INPUTS
    const trimmedInputs: ISavePassword = trimInputs(inputs);

    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_savePasswordSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END: GET AND VALIDATE INPUTS

    // ----------------------------------------------------------------

    // START: VERIFY CURRENT PASSWORD
    if (inputs.verifyCurrentPassword) {
      if (trimmedInputs.currentPassword) {
        const account = await AdminModel.findOne({
          $or: [{ _id: trimmedInputs.userID }, { email: trimmedInputs.email }],
        }).select("password");

        if (!account) {
          return {
            statusCode: ENUMHttpStatusCode.BAD_REQUEST,
            message: ["Account not found"],
          };
        }

        const isCurrentPasswordCorrect = await comparePassword(
          trimmedInputs.currentPassword,
          account.password
        );

        if (!isCurrentPasswordCorrect) {
          return {
            statusCode: ENUMHttpStatusCode.BAD_REQUEST,
            message: ["Current password is incorrect"],
          };
        }
      }
    }
    // END: VERIFY CURRENT PASSWORD

    // ----------------------------------------------------------------

    // START: HASH PASSWORD
    const hashedPassword = await hashPassword(trimmedInputs.confirmedPassword);

    if (!hashedPassword) {
      return {
        statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
        message: ["Internal Server Error"],
      };
    }
    // END: HASH PASSWORD

    // ----------------------------------------------------------------

    // START: UPDATE PASSWORD
    const updatedPassword = await AdminModel.findOneAndUpdate(
      {
        $or: [{ _id: trimmedInputs.userID }, { email: trimmedInputs.email }],
      },
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );

    if (updatedPassword) {
      return {
        statusCode: ENUMHttpStatusCode.OK,
        message: ["Password Updated Successfully"],
      };
    } else {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Failed to Update Password"],
      };
    }
    // END: UPDATE PASSWORD

    // ----------------------------------------------------------------
  } catch (e) {
    console.log("Save Password Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
