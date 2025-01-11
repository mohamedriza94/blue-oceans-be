import swaggerJsDoc from "swagger-jsdoc";
import { envData } from "../constants/env-data";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Savor Spree API",
      version: "1.0.0",
      description: "API documentation for Savor Spree",
    },
    servers: [
      {
        url: `${envData.mainBackendURI}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/routers/**/*.ts"],
};

export const swaggerSpecs = swaggerJsDoc(swaggerOptions);
