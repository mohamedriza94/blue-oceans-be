import { IDeletion } from "../../interfaces/deletion";
import { ITimestamp } from "../../interfaces/timestamp";

export interface IAdmin {
  email: string;
  password: string;
  fullName?: string;
}
