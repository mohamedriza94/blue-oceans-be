import { verifyToken } from "../../../../configurations/jwt";
import { ENUMUserTypes } from "../../../../entities/admin/enums";
import AdminModel from "../../../../entities/admin/model";
import ChiefOccupantModel from "../../../../entities/chief-occupant/model";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";
import { IReturnObj } from "../../../../interfaces/return-obj";
import { createAccessToken } from "./generate-auth-tokens";

export const RefreshAccessToken = async (
  refreshToken: string
): Promise<IReturnObj> => {
  try {
    if (!refreshToken) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["No refresh token provided"],
      };
    }

    const decodedRefreshToken: any = verifyToken(refreshToken);

    if (!decodedRefreshToken) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Invalid refresh token"],
      };
    }

    let user: any = null;

    if (decodedRefreshToken.userType == ENUMUserTypes.Admin) {
      user = await AdminModel.exists({
        _id: decodedRefreshToken._id,
      });
    }

    if (decodedRefreshToken.userType == ENUMUserTypes.Admin) {
      user = await ChiefOccupantModel.findOne({
        _id: decodedRefreshToken._id,
        status: "Active",
      });
    }

    if (!user) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["User not active or not found"],
      };
    }

    const accessToken = createAccessToken(
      decodedRefreshToken._id,
      decodedRefreshToken.userType
    );

    if (!accessToken) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Unable to generate access token"],
      };
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [""],
      data: {
        accessToken,
      },
    };
  } catch (error) {
    return {
      statusCode: ENUMHttpStatusCode.BAD_REQUEST,
      message: ["Invalid or expired refresh token"],
    };
  }
};
