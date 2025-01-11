export interface ILease {
  chiefOccupantId: string;
  apartmentId: string;
  startDate: Date;
  endDate: Date;
  leaseTerms: string;
  status?: "Active" | "Expired" | "Terminated";
}
