import cloudinary from "../../configurations/cloudinary";

export const UploadFiles = async (
  files: Express.Multer.File[],
  folder: string = 'general'
) => {
  const urls: string[] = [];

  try {
    await Promise.all(
      files.map(async (file) => {
        // const compressedFile = await CompressImages(file);

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              if (result && result.secure_url) {
                urls.push(result.secure_url);
                resolve(result.secure_url);
              } else {
                reject(new Error("No secure URL returned from Cloudinary"));
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      })
    );
  } catch (error) {
    console.error("Error uploading images:", error);
    throw new Error("Failed to upload images");
  }

  return urls;
};
