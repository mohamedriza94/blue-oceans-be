import { z } from "zod";
import {
  ENUMPaymentSchedule,
} from "../../../../entities/lease/enum";
import { ILease } from "../../../../entities/lease/i";

export const ZOD_leaseSchema: z.ZodType<Partial<ILease>> = z.object({
  apartmentId: z.string().nonempty("Apartment ID is required"),
  chiefOccupantId: z.string().nonempty("Chief Occupant ID is required"),
  rentAmountInUSD: z.number().min(1, "Rent amount must be greater than 0"),
  paymentSchedule: z.nativeEnum(ENUMPaymentSchedule, {
    invalid_type_error: "Invalid payment schedule",
  }),
  securityDepositInUSD: z
    .number()
    .min(0, "Security deposit must be at least 0"),
  termsAndConditions: z.string().min(1, "Terms and conditions are required"),
});
