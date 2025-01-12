import { Request, Response, NextFunction } from "express";
import { ENUMHttpStatusCode } from "../enums/http-status-codes";
import { ENUMUserTypes } from "../entities/admin/enums";

export const checkRoleAuthorization = (allowedRoles: ENUMUserTypes[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles: ENUMUserTypes[] = req.body.currentUser?.userType;

      // Check if user roles are available
      if (!userRoles || !Array.isArray(userRoles)) {
        return res.status(ENUMHttpStatusCode.BAD_REQUEST).json({
          statusCode: ENUMHttpStatusCode.BAD_REQUEST,
          data: {
            code: "ACCESS_DENIED"
          },
          message: ["Access denied: No roles found"],
        });
      }

      // Check if any user role matches the allowed roles
      const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

      if (!hasAccess) {
        return res.status(ENUMHttpStatusCode.BAD_REQUEST).json({
          statusCode: ENUMHttpStatusCode.BAD_REQUEST,
          data: {
            code: "ACCESS_DENIED"
          },
          message: ["Access denied: Insufficient permissions"],
        });
      }

      // User is authorized; proceed to the next middleware or route
      next();
    } catch (error) {
      return res.status(ENUMHttpStatusCode.INTERNAL_SERVER_ERROR).json({
        statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
        message: ["An error occurred during authorization"],
      });
    }
  };
};
