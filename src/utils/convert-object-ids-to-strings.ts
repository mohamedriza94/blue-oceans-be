import { ObjectId } from "mongodb";

export const convertObjectIdsToStrings = (obj: any): any => {
  if (obj instanceof ObjectId) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertObjectIdsToStrings(item));
  }

  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertObjectIdsToStrings(obj[key]);
      }
    }
    return result;
  }

  return obj;
};
