import { z } from "zod";
import { IDependent } from "../../../../entities/dependant/i";

export const ZOD_dependentSchema: z.ZodType<Partial<IDependent>> = z.object({
  chiefOccupantId: z.string().nonempty("Chief Occupant ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  contactNumber: z
    .string()
    .regex(/^\d{10,15}$/, "Invalid contact number")
    .optional()
    .or(z.literal("")), // Allows an empty string
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")), // Allows an empty string
});
