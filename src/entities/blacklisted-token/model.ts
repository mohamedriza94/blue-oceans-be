import mongoose, { Schema } from "mongoose";
import { IBlacklistedToken } from "./i";

export interface IBlacklistedTokenDocument
  extends IBlacklistedToken,
    Document {}

const BlacklistedTokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const BlacklistedTokenModel = mongoose.model<IBlacklistedTokenDocument>(
  "BlacklistedToken",
  BlacklistedTokenSchema
);

export default BlacklistedTokenModel;
