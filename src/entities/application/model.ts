import mongoose, { Schema, Document } from "mongoose";
import { IApplication } from "./i";

export interface IApplicationDocument extends IApplication, Document {}

const ApplicationSchema: Schema = new Schema({
  chiefOccupantId: {
    type: Schema.Types.ObjectId,
    ref: "ChiefOccupant",
    required: true,
  },
  apartmentId: {
    type: Schema.Types.ObjectId,
    ref: "Apartment",
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Approved", "Rejected"],
    default: "Pending",
  },
});

const ApplicationModel = mongoose.model<IApplicationDocument>(
  "Application",
  ApplicationSchema
);

export default ApplicationModel;
