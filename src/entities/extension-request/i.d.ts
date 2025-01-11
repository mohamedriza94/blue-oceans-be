export interface IExtensionRequest {
  leaseId: string;
  requestedEndDate: Date;
  reason: string;
  status?: "Pending" | "Approved" | "Rejected";
  requestedAt: Date;
}
