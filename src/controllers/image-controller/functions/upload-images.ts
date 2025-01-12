import { UploadFiles } from "../../../../services/cloudinary/upload-files";
import { GetImagesFromUrls } from "./get-images-from-urls";

export const UploadImages = async (
  files: Express.Multer.File[],
  urls: string[]
) => {
  const uploadedUrls: string[] = [];

  // Handle files uploaded via form-data
  if (files) {
    const cloudinaryUrls = await UploadFiles(files, "general");
    uploadedUrls.push(...cloudinaryUrls);
  }

  // Handle image URLs sent via form-data
  if (urls && urls.length > 0) {
    const imageBuffers = await GetImagesFromUrls(urls);
    const cloudinaryUrls = await UploadFiles(imageBuffers, "general");
    uploadedUrls.push(...cloudinaryUrls);
  }

  return uploadedUrls;
};
