import mongoose, { Schema, Document } from "mongoose";
import { IParking } from "./i";

export interface IParkingDocument extends IParking, Document {}

const ParkingSchema: Schema = new Schema({
  buildingId: {
    type: Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  slotNumber: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["Available", "Occupied"],
    default: "Available",
  },
});

const ParkingModel = mongoose.model<IParkingDocument>("Parking", ParkingSchema);

export default ParkingModel;
