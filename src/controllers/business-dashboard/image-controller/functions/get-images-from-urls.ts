import axios from "axios";

export const GetImagesFromUrls = async (urls: string[]) => {
  const imageBuffers: Express.Multer.File[] = [];

  try {
    await Promise.all(
      urls.map(async (url) => {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data, "binary");

        const file = {
          buffer,
          originalname: url.split("/").pop(),
          mimetype: response.headers["content-type"],
        } as Express.Multer.File;

        imageBuffers.push(file);
      })
    );
  } catch (error) {
    console.error("Error fetching images:", error);
    throw new Error("Failed to fetch images from URLs");
  }

  return imageBuffers;
};
