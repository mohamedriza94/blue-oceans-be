import { ITimestamp } from "../../interfaces/timestamp";
import { ENUMPaymentSchedule, ENUMLeaseStatus } from "./enum";

export type TDocumentURL = {
  url: string;
  name: string;
};

export interface ILease extends ITimestamp {
  _id?: string;
  apartmentId: string;
  chiefOccupantId: string;
  startDate: Date;
  endDate: Date;
  rentAmountInUSD: number;
  paymentSchedule: ENUMPaymentSchedule;
  status: ENUMLeaseStatus;
  securityDepositInUSD: number;
  termsAndConditions: string;
  documentURLs?: TDocumentURL[];
}
