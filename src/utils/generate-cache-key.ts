export const generateCacheKey = (
  prefix: string,
  data: string | any[]
): string => {
  const dataStr = Array.isArray(data) ? data.join("_") : data;
  return `${prefix}:${dataStr}`;
};
