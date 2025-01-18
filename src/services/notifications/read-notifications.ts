import NotificationModel from "../../entities/notification/model";
import { ENUMHttpStatusCode } from "../../enums/http-status-codes";
import { IReturnObj } from "../../interfaces/return-obj";

export const ReadNotifications = async (): Promise<IReturnObj> => {
  try {
    const notifications = await NotificationModel.find().sort({
      createdAt: -1,
    });

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: notifications,
    };
  } catch (error) {
    console.error("Failed to add notification:", error);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Failed to get notifications"],
    };
  }
};
