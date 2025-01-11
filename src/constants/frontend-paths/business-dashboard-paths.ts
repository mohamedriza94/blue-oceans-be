import { envData } from "../env-data";

const createPath = (path: string) =>
  `${envData.frontendBusinessDashboardURI}${path}`;

export const BusinessDashboardPaths = {
  HOME: createPath("/"),
  RESET_PASSWORD: createPath("/authentication/reset-password"),
  LOGIN: createPath("/authentication/login"),
} as const;
