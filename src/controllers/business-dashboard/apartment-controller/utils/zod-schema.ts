import { z } from "zod";
import { IApartment } from "../../../../entities/apartment/i";

export const ZOD_apartmentSchema: z.ZodType<Partial<IApartment>> = z.object({
  buildingId: z.string().nonempty("Building ID is required"),
  telephone: z.string().regex(/^\d{10,15}$/, "Invalid telephone number"),
  description: z.string().min(1, "Description is required"),
  identification: z.string().min(1, "Identification is required"),
  class: z.enum(["Luxury", "Standard", "Studio", "Penthouse", "Duplex"]),
  status: z.enum(["Available", "Occupied", "Maintenance"]),
});
