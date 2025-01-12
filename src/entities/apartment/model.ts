import mongoose, { Schema, Document } from "mongoose";
import { IApartment } from "./i";
import { ImageSchema } from "../../schemas/mongoose/image-schema";

export interface IApartmentDocument extends IApartment, Document {}

// Schema
const ApartmentSchema: Schema = new Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  images: [ImageSchema],
  description: {
    type: String,
    required: true,
  },
  identification: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    enum: ["Luxury", "Standard", "Studio", "Penthouse", "Duplex"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Available", "Occupied", "Maintenance"],
    required: true,
  },
});

const ApartmentModel = mongoose.model<IApartmentDocument>(
  "Apartment",
  ApartmentSchema
);

export default ApartmentModel;
