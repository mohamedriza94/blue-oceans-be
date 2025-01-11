import mongoose, { Schema, Document } from "mongoose";
import { IExtensionRequest } from "./i";

export interface IExtensionRequestDocument
  extends IExtensionRequest,
    Document {}

const ExtensionRequestSchema: Schema = new Schema({
  leaseId: {
    type: Schema.Types.ObjectId,
    ref: "Lease",
    required: true,
  },
  requestedEndDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

const ExtensionRequestModel = mongoose.model<IExtensionRequestDocument>(
  "ExtensionRequest",
  ExtensionRequestSchema
);

export default ExtensionRequestModel;
