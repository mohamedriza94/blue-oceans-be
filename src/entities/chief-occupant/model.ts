import mongoose, { Schema, Document } from "mongoose";
import { IChiefOccupant } from "./i";

export interface IChiefOccupantDocument extends IChiefOccupant, Document {}

const ChiefOccupantSchema: Schema = new Schema({
  apartmentId: {
    type: Schema.Types.ObjectId,
    ref: "Apartment",
    required: true,
  },
  image: {
    type: String,
  },
  fullName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  moveInDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
});

const ChiefOccupantModel = mongoose.model<IChiefOccupantDocument>(
  "ChiefOccupant",
  ChiefOccupantSchema
);

export default ChiefOccupantModel;
