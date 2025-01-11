import { IImage } from "../../interfaces/image";

export interface IDependent {
  chiefOccupantId: string;
  fullName: string;
  image: IImage;
  relationship: string;
  contactNumber?: string;
  email?: string;
  dateOfBirth: Date;
}
