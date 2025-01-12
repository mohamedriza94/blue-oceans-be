import { z } from "zod";
import { IApplication } from "../../../../entities/application/i";

export const ZOD_applicationSchema: z.ZodType<Partial<IApplication>> = z.object({
  chiefOccupantId: z.string().nonempty("Chief Occupant ID is required"),
  apartmentId: z.string().nonempty("Apartment ID is required"),
  subject: z.string().min(1, "Subject cannot be empty").max(200, "Subject cannot exceed 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description cannot exceed 1000 characters"),
  status: z.enum(["Pending", "Reviewed", "Approved", "Rejected"]).optional(),
});
