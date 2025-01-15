import mongoose, { Schema, Document } from "mongoose";
import { IBuilding } from "./i";

export interface IBuildingDocument extends IBuilding, Document {}

// Schema
const BuildingSchema: Schema = new Schema({
  buildingName: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  parkingSlots: {
    type: Number,
    required: true,
  },
  chargePerExtraParkingSlotInUSD: {
    type: Number,
    required: true,
  },
});

const BuildingModel = mongoose.model<IBuildingDocument>(
  "Building",
  BuildingSchema
);

export default BuildingModel;
