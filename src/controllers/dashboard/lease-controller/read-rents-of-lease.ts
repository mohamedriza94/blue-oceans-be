import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import RentModel from "../../../entities/rent/model";

export const ReadRentsOfLease = async (
  leaseId: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!leaseId || !isValidObjectId(leaseId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const rentPayments = await RentModel.find({ leaseId }).lean();

    if (!rentPayments) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Rent payment not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: rentPayments,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read Rent Payments Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
