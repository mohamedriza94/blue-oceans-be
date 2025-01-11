import _ from "lodash";

export const getModifiedFields = <T>(
  newData: Partial<T>,
  existingData: Partial<T>
): Partial<T> => {
  const modifiedFields: Partial<T> = {};

  const findModifiedFields = (
    newObj: any,
    existingObj: any,
    parentKey: string = ""
  ) => {
    for (const key in existingObj) {
      if (Object.prototype.hasOwnProperty.call(existingObj, key)) {
        const existingValue = existingObj[key];
        const newValue = newObj[key];

        // Check for deep equality
        if (!_.isEqual(existingValue, newValue)) {
          if (typeof existingValue === "object" && existingValue !== null) {
            // If it's an object, store the entire object instead of just the modified field
            modifiedFields[key as keyof T] = newValue; // Store the entire newValue
          } else {
            // If it's a primitive value, store just the new value
            modifiedFields[key as keyof T] = newValue;
          }
        }
      }
    }

    // Check for any keys in newObj that don't exist in existingObj
    for (const key in newObj) {
      if (Object.prototype.hasOwnProperty.call(newObj, key)) {
        if (!existingObj.hasOwnProperty(key)) {
          modifiedFields[key as keyof T] = newObj[key];
        }
      }
    }
  };

  findModifiedFields(newData, existingData);

  // Function to clean up modifiedFields by removing undefined or null values
  const cleanModifiedFields = (fields: Partial<T>): Partial<T> => {
    for (const key in fields) {
      if (fields[key] === undefined || fields[key] === null) {
        delete fields[key];
      }
    }
    return fields;
  };

  // Clean the modifiedFields before returning
  return cleanModifiedFields(modifiedFields);
};