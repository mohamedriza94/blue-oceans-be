import { IImage } from "../../interfaces/image";

export interface IChiefOccupant {
  apartmentId: string;
  image: IImage;
  fullName: string;
  contactNumber: string;
  email: string;
  password: string;
  moveInDate?: Date;
  status?: "Active" | "Inactive";
}
