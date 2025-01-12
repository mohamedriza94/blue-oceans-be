import { z } from "zod";
import { IBuilding } from "../../../../entities/building/i";

export const ZOD_buildingSchema: z.ZodType<Partial<IBuilding>> = z.object({
  buildingName: z.string().min(1, "Building name is required"),
  telephone: z.string().regex(/^\d{10,15}$/, "Invalid telephone number"),
  address: z.string().min(1, "Address is required"),
  parkingSlots: z.number().min(0, "Parking slots must be 0 or more"),
});
