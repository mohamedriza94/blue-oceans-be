import { Router } from "express";
import { VerifyAccount } from "../controllers/dashboard/reset-password-controller/functions/verify-account/func";
import { VerifyResetToken } from "../controllers/dashboard/reset-password-controller/functions/verify-reset-token/func";
import { ResetPasswordViaLink } from "../controllers/dashboard/reset-password-controller/functions/reset-password-via-link/func";
import { checkAuthentication } from "../middlewares/check-authentication";
import { IChiefOccupant } from "../entities/chief-occupant/i";
import { ISavePassword } from "../controllers/dashboard/reset-password-controller/interfaces/i";
import { SavePassword } from "../controllers/dashboard/reset-password-controller/functions/save-password/func";

const resetPasswordRoutes = Router();

// --------------------------------

resetPasswordRoutes.post("/verify-account", async (req, res) => {
  const response = await VerifyAccount(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

resetPasswordRoutes.post("/verify-reset-token", async (req, res) => {
  const response = await VerifyResetToken(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

resetPasswordRoutes.post("/reset-password-via-link", async (req, res) => {
  const response = await ResetPasswordViaLink(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

resetPasswordRoutes.post(
  "/update-password",
  checkAuthentication,
  async (req, res) => {
    const { _id: userID, email } = req.body
      .currentUser as Partial<IChiefOccupant> & { _id: string };
    const payload: ISavePassword = {
      userID: userID.toString(),
      email,
      password: req.body.newPassword,
      confirmedPassword: req.body.confirmedNewPassword,
      verifyCurrentPassword: true,
      currentPassword: req.body.currentPassword,
    };

    const response = await SavePassword(payload);

    return res.status(response.statusCode).json(response);
  }
);

// --------------------------------

export default resetPasswordRoutes;
