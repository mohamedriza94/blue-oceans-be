import { Request, Response, NextFunction } from "express";
import { ENUMHttpStatusCode } from "../enums/http-status-codes";
import { verifyToken } from "../configurations/jwt";
import AdminModel from "../entities/admin/model";
import { ENUMUserTypes } from "../entities/admin/enums";
import ChiefOccupantModel from "../entities/chief-occupant/model";
import { ENUMAuthTokenTypes } from "../controllers/dashboard/authentication-controller/functions/generate-auth-tokens";

export const checkAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(ENUMHttpStatusCode.UNAUTHORIZED).json({
      statusCode: ENUMHttpStatusCode.UNAUTHORIZED,
      message: ["Authorization token is required and must be in Bearer format"],
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify Token
    const decodedData: any = await verifyToken(token);
    if (!decodedData) {
      return res.status(ENUMHttpStatusCode.UNAUTHORIZED).json({
        statusCode: ENUMHttpStatusCode.UNAUTHORIZED,
        message: ["Token verification failed"],
      });
    }

    // Verify that its the access token
    if (decodedData.tokenType !== ENUMAuthTokenTypes.Access) {
      return res.status(ENUMHttpStatusCode.UNAUTHORIZED).json({
        statusCode: ENUMHttpStatusCode.UNAUTHORIZED,
        message: ["This is not the access token"],
      });
    }

    let userData: any = null;

    if (decodedData.userType == ENUMUserTypes.Admin) {
      userData = await AdminModel.findOne({
        _id: decodedData._id,
      })
        .lean()
        .select("-password");
    }

    if (decodedData.userType == ENUMUserTypes.ChiefOccupant) {
      userData = await ChiefOccupantModel.findOne({
        _id: decodedData._id,
        status: "Active",
      })
        .lean()
        .select("-password");
    }

    // Attach User Data to Request Object
    req.body.currentUser = { ...userData, userType: decodedData.userType };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(ENUMHttpStatusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal server error"],
    });
  }
};
