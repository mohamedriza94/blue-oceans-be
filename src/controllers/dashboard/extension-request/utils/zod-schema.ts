import { z } from "zod";
import { ENUMExtRequest } from "../../../../entities/extension-request/enum";

export const ZOD_extensionRequestSchema = z.object({
  reason: z.string().optional(),
});
