export interface IParking {
  buildingId: string;
  slotNumber: string;
  status: "Available" | "Occupied";
}
