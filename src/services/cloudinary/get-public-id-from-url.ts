export const getPublicIdFromUrl = (
  publicIdPrefix: string,
  url: string
): string | null => {
  const parts = url.split("/");
  const publicIdWithExtension = parts[parts.length - 1];
  const publicId = `${publicIdPrefix}/${publicIdWithExtension.split(".")[0]}`;
  return publicId || null;
};
