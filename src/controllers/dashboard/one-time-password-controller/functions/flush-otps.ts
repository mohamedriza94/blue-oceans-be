import OneTimePasswordModel from "../../../../entities/otp/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";

export const FlushOtps = async (): Promise<IReturnObj> => {
  try {
    // START : CALCULATE TIME LIMIT
    const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    // END : CALCULATE TIME LIMIT

    // ----------------------------------------------------------------

    // START : DELETE OLD TOKENS
    const result = await OneTimePasswordModel.deleteMany({
      createdAt: { $lt: timeLimit },
    });
    // END : DELETE OLD TOKENS

    // ----------------------------------------------------------------

    // START : RETURN DELETED COUNT
    const deletedCount = result.deletedCount;
    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [
        deletedCount > 0
          ? `${deletedCount} OTP(s) flushed`
          : `No OTPs to flush`,
      ],
      data: {
        deletedCount: 10,
      },
    };
    // END : RETURN DELETED COUNT
  } catch (error) {
    console.error("Error deleting old tokens:", error);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
