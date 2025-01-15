import mongoose, { Schema, Document } from "mongoose";
import { IRent } from "./i";
import { ENUMRentPaymentStatus } from "./enum";

export interface IRentDocument extends Omit<IRent, "_id">, Document {}

const RentSchema: Schema = new Schema(
  {
    leaseId: {
      type: Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(ENUMRentPaymentStatus),
      required: true,
      default: ENUMRentPaymentStatus.Pending,
    },
    paymentDate: {
      type: Date,
      required: false,
    },
    remarks: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const RentModel = mongoose.model<IRentDocument>("Rent", RentSchema);

export default RentModel;
