import mongoose, { Schema, Document } from "mongoose";
import { ILease } from "./i";
import { ENUMPaymentSchedule, ENUMLeaseStatus } from "./enum";

export interface ILeaseDocument extends Omit<ILease, "_id">, Document {}

const LeaseSchema: Schema = new Schema(
  {
    apartmentId: {
      type: Schema.Types.ObjectId,
      ref: "Apartment",
      required: true,
    },
    chiefOccupantId: {
      type: Schema.Types.ObjectId,
      ref: "ChiefOccupant",
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
    rentAmountInUSD: {
      type: Number,
      required: true,
    },
    paymentSchedule: {
      type: String,
      enum: Object.values(ENUMPaymentSchedule),
      default: ENUMPaymentSchedule.Monthly,
    },
    status: {
      type: String,
      enum: Object.values(ENUMLeaseStatus),
      default: ENUMLeaseStatus.Active,
    },
    securityDepositInUSD: {
      type: Number,
      required: true,
    },
    termsAndConditions: {
      type: String,
      required: true,
    },
    documentURLs: [
      {
        url: {
          type: String,
        },
        name: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const LeaseModel = mongoose.model<ILeaseDocument>("Lease", LeaseSchema);

export default LeaseModel;
