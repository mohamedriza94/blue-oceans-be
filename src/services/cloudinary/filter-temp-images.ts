import { IImage } from "../../interfaces/image";

export function filterTempImages(images: IImage[]) {
  const tempImages = images.filter((image) => image.url.includes("/temp/"));
  const permanentImages = images.filter(
    (image) => !image.url.includes("/temp/")
  );

  return { tempImages, permanentImages };
}
