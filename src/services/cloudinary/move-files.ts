import { v2 as cloudinary } from "cloudinary";
import { getPublicIdFromUrl } from "./get-public-id-from-url";
import { IImage } from "../../interfaces/image";

export const moveFile = async (
  imageUrl: string,
  targetFolder: string,
  currentFolder: string
): Promise<string | null> => {
  try {
    const currentPublicId = getPublicIdFromUrl(currentFolder, imageUrl);

    if (!currentPublicId) {
      throw new Error("Invalid image URL or folder structure.");
    }

    const targetPublicId = currentPublicId.replace(currentFolder, targetFolder);

    const renameResponse = await cloudinary.uploader.rename(
      currentPublicId,
      targetPublicId
    );

    await cloudinary.uploader.destroy(currentPublicId);

    return renameResponse.secure_url;
  } catch (error) {
    console.error("Error moving image to new folder:", error);
    throw error;
  }
};

export const moveFileFromTemp = (imageUrl: string, targetFolder: string) => {
  return moveFile(imageUrl, targetFolder, "temp");
};

export const updateFile = async (
  oldFileUrl: string,
  newFileUrl: string,
  targetFolder: string
): Promise<string | null> => {
  try {
    if (oldFileUrl && oldFileUrl != "") {
      // Delete the old file
      const oldPublicId = getPublicIdFromUrl(targetFolder, oldFileUrl);

      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    // Move the new file from the temp folder to the target folder
    const updatedFileUrl = await moveFileFromTemp(newFileUrl, targetFolder);

    return updatedFileUrl;
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
};

export const bulkMoveFilesFromTemp = async (
  images: IImage[],
  folderName: string
) => {
  let uploads = [];

  for (let i = 0; i < images.length; i++) {
    const tempImage = images[i];
    if (tempImage) {
      const newImageUrl = await moveFileFromTemp(tempImage.url, folderName);
      if (newImageUrl) {
        uploads.push({ ...tempImage, url: newImageUrl });
      } else {
        continue;
      }
    }
  }

  return uploads;
};
