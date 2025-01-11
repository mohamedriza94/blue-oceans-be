import mongoose, { Schema, Document } from "mongoose";
import { IDependent } from "./i";
import { ImageSchema } from "../../schemas/mongoose/image-schema";

export interface IDependentDocument extends IDependent, Document {}

const DependentSchema: Schema = new Schema({
  chiefOccupantId: {
    type: Schema.Types.ObjectId,
    ref: "ChiefOccupant",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  image: ImageSchema,
  relationship: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
});

const DependentModel = mongoose.model<IDependentDocument>(
  "Dependent",
  DependentSchema
);

export default DependentModel;
