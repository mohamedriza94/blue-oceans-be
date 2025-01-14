import { ITimestamp } from "../../interfaces/timestamp";
import { ENUMRentPaymentStatus } from "./enum";

export interface IRent extends ITimestamp {
  _id?: string;
  leaseId: string;
  dueDate: Date;
  amount: number;
  paymentStatus: ENUMRentPaymentStatus;
  paymentDate?: Date;
  remarks?: string;
}
