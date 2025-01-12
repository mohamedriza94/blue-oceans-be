import BlacklistedTokenModel from "../../../../entities/blacklisted-token/model";

export const IsTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    // START : CHECK TOKEN EXISTENCE
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      return false;
    }
    // END : CHECK TOKEN EXISTENCE

    // ----------------------------------------------------------------

    // START : CHECK TOKEN BLACKLIST
    const isTokenBlacklisted = await BlacklistedTokenModel.exists({
      token: trimmedToken,
    });

    return !!isTokenBlacklisted;
    // END : CHECK TOKEN BLACKLIST
  } catch (error) {
    console.error("Error checking if token is blacklisted:", error);
    return false;
  }
};
