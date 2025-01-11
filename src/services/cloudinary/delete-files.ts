import cloudinary from "../../configurations/cloudinary";
import { getPublicIdFromUrl } from "./get-public-id-from-url";

export const DeleteFiles = async (
  publicIdPrefix: string = "",
  URLs: string[]
): Promise<{ deletedCount: number; failedCount: number }> => {
  try {
    // START: GET PUBLIC IDs
    const publicIDs = URLs.map((url) => getPublicIdFromUrl(publicIdPrefix, url)).filter(
      (id): id is string => id !== null
    );

    if (publicIDs.length === 0) {
      return { deletedCount: 0, failedCount: URLs.length };
    }
    // END: GET PUBLIC IDs

    // ----------------------------------------------------------------

    // START: DELETING FILES
    const deletePromises = publicIDs.map((publicID) =>
      cloudinary.uploader.destroy(publicID)
    );

    const results = await Promise.all(deletePromises);
    // END: DELETING FILES

    // ----------------------------------------------------------------

    const deletedCount = results.filter(
      (result) => result.result === "ok"
    ).length;
    const failedCount = results.filter(
      (result) => result.result !== "ok"
    ).length;

    return { deletedCount, failedCount };
  } catch (error) {
    console.log("Error deleting files from Cloudinary", error);
    throw new Error("Failed to delete files");
  }
};
