import { v2 as cloudinary } from "cloudinary";
import { IReturnObj } from "../../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../../enums/http-status-codes";

export const FlushOldTempFiles = async (): Promise<IReturnObj> => {
  try {
    const MAX_RESULTS_PER_CALL = 500;
    let nextCursor: string | undefined;

    do {
      const response = await cloudinary.api.resources({
        type: "upload",   
        prefix: "temp/",
        max_results: MAX_RESULTS_PER_CALL,
        next_cursor: nextCursor,
      });

      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      // Filter resources older than 24 hours
      const oldResources = response.resources.filter(
        (resource: typeof response.resource) => {
          const createdAt = new Date(resource.created_at).getTime();
          return now - createdAt > oneDayInMs;
        }
      );

      // Destroy the old resources
      for (const resource of oldResources) {
        await cloudinary.uploader.destroy(resource.public_id);
        console.log(`Deleted: ${resource.public_id}`);
      }

      // If there's more data, paginate
      nextCursor = response.next_cursor;
    } while (nextCursor);

    console.log("Cleanup complete");
    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Files Flushed"],
    };
  } catch (err) {
    console.error("Error while deleting old temp images:", err);

    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
