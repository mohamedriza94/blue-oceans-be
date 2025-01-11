import { ENUMHttpStatusCode } from "../enums/http-status-codes";

export interface IReturnObj<T = object> {
  statusCode: ENUMHttpStatusCode;
  message: string[]; // Array of messages (for errors or success notifications)
  data?: any; // Data object, to return any data
}
