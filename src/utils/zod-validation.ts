import { ZodSchema } from "zod";
import { IReturnObj } from "../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../enums/http-status-codes";

export const zodValidate = <T>(
  schema: ZodSchema<T>,
  inputs: unknown
): IReturnObj | null => {
  const result = schema.safeParse(inputs);

  if (!result.success) {
    return {
      statusCode: ENUMHttpStatusCode.BAD_REQUEST,
      message: result.error.errors.map((err) => err.message),
    };
  }

  return null;
};
