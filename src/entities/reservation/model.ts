import mongoose, { Schema, Document } from "mongoose";
import { IReservation } from "./i";

export interface IReservationDocument extends IReservation, Document {}

const ReservationSchema: Schema = new Schema({
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
  reservationDate: {
    type: Date,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Completed"],
    default: "Pending",
  },
});

const ReservationModel = mongoose.model<IReservationDocument>(
  "Reservation",
  ReservationSchema
);

export default ReservationModel;
