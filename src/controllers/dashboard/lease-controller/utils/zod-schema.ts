import { z } from "zod";
import { ILease } from "../../../../entities/lease/i";

export const ZOD_leaseSchema: z.ZodType<Partial<ILease>> = z.object({
  chiefOccupantId: z.string().nonempty("Chief Occupant ID is required"),
  apartmentId: z.string().nonempty("Apartment ID is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  leaseTerms: z.string().min(10, "Lease terms is required"),
  status: z.enum(["Active", "Expired", "Terminated"]).optional(),
});
