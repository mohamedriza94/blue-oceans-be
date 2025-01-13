import { z } from "zod";
import { IChiefOccupant } from "../../../../entities/chief-occupant/i";

export const ZOD_chiefOccupantSchema: z.ZodType<Partial<IChiefOccupant>> = z.object({
  apartmentId: z.string().nonempty("Apartment ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  contactNumber: z.string().regex(/^\d{10,15}$/, "Invalid contact number"),
  email: z.string().email("Invalid email address"),
  status: z.enum(["Active", "Inactive"]).optional(),
});
