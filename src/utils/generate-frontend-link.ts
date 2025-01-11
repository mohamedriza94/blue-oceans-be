export const generateFrontendLink = (
  frontendURI: string,
  path: string,
  params: Record<string, string> = {}
) => {
  let url = `${frontendURI}${path}`;
  const queryString = new URLSearchParams(params).toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  return url;
};
