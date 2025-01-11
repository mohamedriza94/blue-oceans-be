import mongoose, { Schema, Document } from "mongoose";
import { ILease } from "./i";

export interface ILeaseDocument extends ILease, Document {}

const LeaseSchema: Schema = new Schema({
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
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  leaseTerms: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Expired", "Terminated"],
    default: "Active",
  },
});

const LeaseModel = mongoose.model<ILeaseDocument>("Lease", LeaseSchema);

export default LeaseModel;
