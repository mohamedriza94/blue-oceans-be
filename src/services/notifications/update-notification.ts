import NotificationModel from "../../entities/notification/model";

export const UpdateNotificationById = async (notificationId: string) => {
  try {
    await NotificationModel.findByIdAndUpdate(notificationId, {
      status: "read",
    });
    return;
  } catch (error) {
    console.error("Failed to add notification:", error);
    return;
  }
};
