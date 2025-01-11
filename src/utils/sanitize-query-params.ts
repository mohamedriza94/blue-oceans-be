export const sanitizeQueryParams = (params: { [key: string]: any }) => {
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === "" || value === "undefined" || value === undefined) {
      delete params[key];
    }
  });
  return params;
};
