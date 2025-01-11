import { z } from "zod";
import { IAuthor } from "../../interfaces/author";

export const ZOD_AuthorSchema: z.ZodType<IAuthor> = z.object({
  avatar: z.string().url({ message: "Avatar must be a valid URL." }).optional(),
  name: z.string().min(1, { message: "Author name is required." }),
  profileURL: z
    .string()
    .url({ message: "Profile URL must be a valid URL." })
    .optional(),
});
