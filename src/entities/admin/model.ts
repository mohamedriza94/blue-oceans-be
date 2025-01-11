import mongoose, { Schema, Document } from "mongoose";
import { IAdmin } from "./i";

export interface IAdminDocument extends IAdmin, Document {}

const AdminSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
  },
});

const AdminModel = mongoose.model<IAdminDocument>("Admin", AdminSchema);

export default AdminModel;
