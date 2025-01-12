import { sendTransactionalEmail } from "../../../configurations/email-api/brevo";
import { TEmailOptions } from "../../../configurations/email-api/types";
import { BusinessDashboardPaths } from "../../../constants/frontend-paths/business-dashboard-paths";
import ApartmentModel from "../../../entities/apartment/model";
import { IChiefOccupant } from "../../../entities/chief-occupant/i";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { hashPassword } from "../../../services/bcrypt/functions";
import { generateRandomPassword } from "../../../utils/generate-random-password";
import { trimInputs } from "../../../utils/trim-inputs";
import { zodValidate } from "../../../utils/zod-validation";
import { ZOD_chiefOccupantSchema } from "./utils/zod-schema";

export const CreateChiefOccupant = async (
  inputs: IChiefOccupant
): Promise<IReturnObj> => {
  try {
    // START : INPUT DESTRUCTURING
    const trimmedInputs: typeof inputs = trimInputs(inputs);
    // END : INPUT DESTRUCTURING

    // ----------------------------------------------------------------

    // START : INPUT VALIDATION CHECK
    const validationErrors: IReturnObj | null = zodValidate(
      ZOD_chiefOccupantSchema,
      trimmedInputs
    );
    if (validationErrors) {
      return validationErrors;
    }
    // END : INPUT VALIDATION CHECK

    // ----------------------------------------------------------------

    // START : APARTMENT VALIDATION
    const apartment = await ApartmentModel.findOne({
      _id: trimmedInputs.apartmentId,
      status: "Available",
    });

    if (!apartment) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["The provided apartment is either invalid or not available"],
      };
    }
    // END : APARTMENT VALIDATION

    // ----------------------------------------------------------------

    // START : DUPLICATION CHECK
    const existingOccupant = await ChiefOccupantModel.findOne({
      email: trimmedInputs.email,
      contactNumber: trimmedInputs.contactNumber,
    });
    if (existingOccupant) {
      return {
        statusCode: ENUMHttpStatusCode.CONFLICT,
        message: [
          `A chief occupant with this email or contact number already exists`,
        ],
      };
    }
    // END : DUPLICATION CHECK

    // ----------------------------------------------------------------

    // START : HASH PASSWORD
    const randomPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(randomPassword);

    if (!hashedPassword) {
      return {
        statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
        message: ["Internal Server Error"],
      };
    }
    // END : HASH PASSWORD

    // ----------------------------------------------------------------

    // START : CREATE CHIEF OCCUPANT ACCOUNT
    const newOccupant = new ChiefOccupantModel({
      ...trimmedInputs,
      password: hashedPassword,
    });
    await newOccupant.save();

    const { password, ...restNewAccountData } = newOccupant.toObject();
    // END : CREATE CHIEF OCCUPANT ACCOUNT

    // ----------------------------------------------------------------

    // START : SEND EMAIL
    const firstName = trimmedInputs.fullName?.split(" ")[0];
    const emailOptions: TEmailOptions = {
      to: [{ email: trimmedInputs.email, name: firstName }],
      subject: "Chief Occupant Account Credentials",
      templateType: "brevo",
      templateData: {
        id: "3",
        params: {
          firstName: firstName,
          email: trimmedInputs.email,
          tempPassword: randomPassword,
          loginUrl: BusinessDashboardPaths.CHIEF_OCCUPANT_LOGIN,
        },
      },
    };

    const signupMailSent = await sendTransactionalEmail(emailOptions);
    // END : SEND EMAIL

    // ----------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Chief occupant account created successfully"],
      data: { account: restNewAccountData, signupMailSent },
    };
  } catch (e) {
    console.log("Create Chief Occupant Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
