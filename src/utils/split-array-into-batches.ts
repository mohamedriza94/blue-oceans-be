export const splitIntoBatches = (array: any[], batchSize: number): any[] => {
  if (batchSize <= 0) return [];

  const result: any[] = [];

  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
};
