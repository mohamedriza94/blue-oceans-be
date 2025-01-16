import { isValidObjectId } from "mongoose";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import LeaseModel from "../../../entities/lease/model";
import { ENUMLeaseStatus } from "../../../entities/lease/enum";

export const GetOccupantLease = async (
  chiefOccupantId: string
): Promise<IReturnObj> => {
  try {
    // START : VALIDATE PARAMS
    if (!chiefOccupantId || !isValidObjectId(chiefOccupantId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : FETCH RESULT
    const lease = await LeaseModel.findOne({
      chiefOccupantId,
      status: ENUMLeaseStatus.Active,
    })
      .populate("chiefOccupantId") // Populate chief occupant fields
      .populate("apartmentId") // Populate apartment fields
      .lean();

    if (!lease) {
      return {
        statusCode: ENUMHttpStatusCode.NOT_FOUND,
        message: ["Lease not found"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: lease,
    };
    // END : FETCH RESULT
  } catch (e) {
    console.error("Read One Lease Error", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
