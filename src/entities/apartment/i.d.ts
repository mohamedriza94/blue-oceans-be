import { IImage } from "../../interfaces/image";

export interface IApartment {
  buildingId: string;
  telephone: string;
  images: IImage[];
  description: string;
  class: "Luxury" | "Standard" | "Studio" | "Penthouse" | "Duplex";
  status: "Available" | "Occupied" | "Maintenance";
}
