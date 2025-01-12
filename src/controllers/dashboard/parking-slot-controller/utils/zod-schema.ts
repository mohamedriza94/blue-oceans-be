import { z } from "zod";
import { IParking } from "../../../../entities/parking/i";

export const ZOD_parkingSchema: z.ZodType<Partial<IParking>> = z.object({
  buildingId: z.string().nonempty("Building ID is required"),
  slotNumber: z.string().min(1, "Slot number is required"),
  status: z.enum(["Available", "Occupied"]),
});
