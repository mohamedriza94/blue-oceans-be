import BlacklistedTokenModel from "../../../../entities/blacklisted-token/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";

export const BlacklistToken = async (token: string): Promise<IReturnObj> => {
  try {
    // START : CHECK TOKEN EXISTENCE
    if (!token || token.trim() === "") {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Token not found"],
      };
    }

    const trimmedToken = token.trim();
    // END : CHECK TOKEN EXISTENCE

    // ----------------------------------------------------------------

    // START : CHECK TOKEN BLACKLIST
    const isTokenBlacklisted = await BlacklistedTokenModel.exists({
      token: trimmedToken,
    });

    if (isTokenBlacklisted) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Token is already blacklisted"],
      };
    }
    // END : CHECK TOKEN BLACKLIST

    // ----------------------------------------------------------------

    // START : BLACKLIST TOKEN
    const blacklistedToken = new BlacklistedTokenModel({
      token: trimmedToken,
    });

    await blacklistedToken.save();

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Token successfully blacklisted"],
    };
    // END : BLACKLIST TOKEN
  } catch (error) {
    console.error("Token blacklist check error:", error);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal server error"],
    };
  }
};
