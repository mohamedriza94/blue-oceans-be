import { INotification } from "../../entities/notification/i";
import NotificationModel from "../../entities/notification/model";

export const AddNotification = async (inputs: INotification) => {
  try {
    const newNotification = new NotificationModel(inputs);
    await newNotification.save();
  } catch (error) {
    console.error("Failed to add notification:", error);
  }
};
