import { ENUMExtRequest } from "./enum";

export interface IExtensionRequest {
  leaseId: string;
  requestedEndDate: Date;
  reason: string;
  status?: ENUMExtRequest;
  requestedAt?: Date;
}
