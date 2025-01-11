export interface IApplication {
  chiefOccupantId: string;
  apartmentId: string;
  submittedAt: Date;
  subject: string;
  description: string;
  status?: "Pending" | "Reviewed" | "Approved" | "Rejected";
}
