import mongoose, { Schema, Document } from "mongoose";
import { IOneTimePassword } from "./i";

export interface IOneTimePasswordDocument extends IOneTimePassword, Document {}

// Schema
const OneTimePasswordSchema: Schema = new Schema<IOneTimePassword>({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  otp: {
    type: String,
    required: true,
  },
  validityDurationInMinutes: {
    type: Number,
    default: 15,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OneTimePasswordModel = mongoose.model<IOneTimePasswordDocument>(
  "OneTimePassword",
  OneTimePasswordSchema
);

export default OneTimePasswordModel;
