import { generateToken } from "../../../../configurations/jwt";
import { ENUMUserTypes } from "../../../../entities/admin/enums";

interface IReturnAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export enum ENUMAuthTokenTypes {
  Access = "access",
  Refresh = "refresh",
}

export const GenerateAuthTokens = (
  userID: string,
  tokenValidityDuration: string,
  userType: ENUMUserTypes
): IReturnAuthTokens | null => {
  const accessToken = createAccessToken(userID, userType);
  const refreshToken = generateToken(
    { _id: userID, tokenType: ENUMAuthTokenTypes.Refresh, userType },
    tokenValidityDuration
  );

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
};

export const createAccessToken = (
  userID: string,
  userType: ENUMUserTypes
) => {
  return generateToken(
    { _id: userID, tokenType: ENUMAuthTokenTypes.Access, userType },
    "1h"
  );
};
