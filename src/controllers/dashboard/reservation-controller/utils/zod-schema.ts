import { z } from "zod";
import { IReservation } from "../../../../entities/reservation/i";

export const ZOD_reservationSchema: z.ZodType<Partial<IReservation>> = z.object(
  {
    chiefOccupantId: z.string().nonempty("Chief Occupant ID is required"),
    apartmentId: z.string().nonempty("Apartment ID is required"),
    reservationDate: z.date({
      invalid_type_error: "Reservation date must be a valid date",
    }),
    purpose: z.string().min(1, "Purpose is required"),
    status: z.enum(["Pending", "Approved", "Rejected", "Completed"]).optional(),
  }
);
