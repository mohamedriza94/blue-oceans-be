import { Router } from "express";
import { AdminLogin } from "../controllers/dashboard/authentication-controller/functions/admin-login";
import { ENUMHttpStatusCode } from "../enums/http-status-codes";
import { ChiefOccupantLogin } from "../controllers/dashboard/authentication-controller/functions/chief-occupant-login";
import { RefreshAccessToken } from "../controllers/dashboard/authentication-controller/functions/refresh-access-token";

const authenticationRoutes = Router();

authenticationRoutes.post("/admin-login", async (req, res) => {
  const response = await AdminLogin(req.body);

  if (response) {
    if (response.statusCode === ENUMHttpStatusCode.OK) {
      const { refreshToken } = response.data.jwt;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
    }

    return res.status(response.statusCode).json(response);
  } else {
    return res.status(ENUMHttpStatusCode.NOT_IMPLEMENTED);
  }
});

authenticationRoutes.post("/chief-occupant-login", async (req, res) => {
  const response = await ChiefOccupantLogin(req.body);

  if (response) {
    if (response.statusCode === ENUMHttpStatusCode.OK) {
      const { refreshToken } = response.data.jwt;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
    }

    return res.status(response.statusCode).json(response);
  } else {
    return res.status(ENUMHttpStatusCode.NOT_IMPLEMENTED);
  }
});

authenticationRoutes.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    const response = await RefreshAccessToken(refreshToken);

    if (
      response.statusCode === ENUMHttpStatusCode.OK &&
      response.data.accessToken
    ) {
      return res.status(response.statusCode).json(response.data);
    } else {
      return res.status(ENUMHttpStatusCode.UNAUTHORIZED).json("Unauthorized");
    }
  } catch (e) {
    return res.status(ENUMHttpStatusCode.UNAUTHORIZED).json("Unauthorized");
  }
});

authenticationRoutes.post("/logout", async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res.status(ENUMHttpStatusCode.OK).json({
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Logout Successful"],
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(ENUMHttpStatusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Logout failed"],
    });
  }
});

export default authenticationRoutes;
