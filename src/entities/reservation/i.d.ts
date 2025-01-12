export interface IReservation {
  chiefOccupantId: string;
  apartmentId: string;
  reservationDate: Date;
  purpose: string;
  status?: "Pending" | "Approved"| "Approved" | "Rejected" | "Completed";
}
