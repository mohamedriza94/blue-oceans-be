import sharp from "sharp";

export const CompressImages = async (file: Express.Multer.File) => {
  try {
    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 800 })
      .toFormat("jpeg", { quality: 100 })
      .toBuffer();

    return {
      ...file,
      buffer: compressedBuffer,
    };
  } catch (error) {
    console.error("Error compressing image:", error);
    throw new Error("Failed to compress image");
  }
};
