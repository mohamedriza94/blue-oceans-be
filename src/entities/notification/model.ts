import mongoose, { Schema, Document } from "mongoose";
import { INotification } from "./i";

const NotificationSchema: Schema = new Schema(
  {
    status: {
      type: String,
      enum: ["read", "unread"],
      required: true,
    },
    icon: {
      type: String,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    showToChiefOccupantId: {
      type: Schema.Types.ObjectId,
      ref: "ChiefOccupant",
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default NotificationModel;
