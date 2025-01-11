export const slugify = (text: string, symbol: string = "-"): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, symbol)
    .replace(/[^\w-]+/g, "");
};
