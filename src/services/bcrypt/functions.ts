import bcrypt from "bcrypt";

const saltRounds = 10;

export const hashPassword = async (password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log("error hashing password", error);
    return null;
  }
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
