import { z } from "zod";

export const ZOD_savePasswordSchema = z
  .object({
    password: z.string().min(1, { message: "Password is required" }),
    confirmedPassword: z
      .string()
      .min(1, { message: "Confirmed Password is required" }),
    email: z.string().email().optional(),
    userID: z.string().optional(),
    currentPassword: z.string().optional(),
    verifyCurrentPassword: z.boolean().optional(),
  })
  .refine((data) => data.email || data.userID, {
    message: "Either Email or User ID must be provided",
    path: ["email", "userID"],
  })
  .refine(
    (data) => {
      if (data.verifyCurrentPassword) {
        return data.currentPassword && data.currentPassword.length > 0;
      }
      return true;
    },
    {
      message: "Current password is required",
      path: ["currentPassword"],
    }
  )
  .superRefine((data, ctx) => {
    const passwordErrors: string[] = [];

    if (data.password.length < 8) {
      passwordErrors.push("at least 8 characters long");
    }
    if (!/[A-Z]/.test(data.password)) {
      passwordErrors.push("contain one uppercase letter");
    }
    if (!/[a-z]/.test(data.password)) {
      passwordErrors.push("contain one lowercase letter");
    }
    if (!/\d/.test(data.password)) {
      passwordErrors.push("contain at least one number");
    }

    if (passwordErrors.length > 0) {
      const errorMessage =
        passwordErrors.length > 1
          ? `Password must be: ${passwordErrors.slice(0, -1).join(", ")} and ${
              passwordErrors[passwordErrors.length - 1]
            }`
          : `Password must be: ${passwordErrors[0]}`;

      ctx.addIssue({
        path: ["password"],
        message: errorMessage,
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.password !== data.confirmedPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Passwords do not match",
        code: z.ZodIssueCode.custom,
      });
    }
  });
