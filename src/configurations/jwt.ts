import jwt from "jsonwebtoken";
import { envData } from "../constants/env-data";
import { generateRandomNumber } from "../utils/generate-random-number";

const secretKey =
  envData.jwtSecret ||
  "64333f19993bb83814e903a38221320bf8c34ef44dc1c242b2afa4d9988c4592";

export const generateToken = (
  payload: object,
  expiresIn: string = "1h"
): string | null => {
  try {
    return jwt.sign(
      { ...payload, tokenID: generateRandomNumber(10) },
      secretKey,
      { expiresIn }
    );
  } catch (error) {
    return null;
  }
};

export const verifyToken = (token: string): object | null => {
  try {
    return jwt.verify(token, secretKey) as object;
  } catch (error) {
    return null;
  }
};
