import { z } from "zod";
import { ISEO } from "../../interfaces/seo";

const ImageSchema = z.object({
  url: z
    .string({
      required_error: "Image URL is required.",
    })
    .url({ message: "Invalid image URL." }),
  alt: z.string().optional(),
});

const SEOOgSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: ImageSchema.optional(),
});

const SEOTwitterSchema = z.object({
  card: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: ImageSchema.optional(),
  site: z.string().optional(),
});

const SEOHrefLangSchema = z.object({
  href: z.string().url({ message: "Invalid URL for hrefLang." }),
  hreflang: z.string().min(1, { message: "hreflang is required." }),
});

const SEOAdditionalMetaSchema = z.object({
  name: z.string().min(1, { message: "Meta tag name is required." }),
  content: z.string().min(1, { message: "Meta tag content is required." }),
});

const SEORobotsAdvancedSchema = z.object({
  noarchive: z.boolean().optional(),
  nosnippet: z.boolean().optional(),
  notranslate: z.boolean().optional(),
});

export const ZOD_SEOSchema: z.ZodType<Partial<ISEO>> = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  robots: z.string().optional(),
  image: ImageSchema.optional(),
  canonicalURL: z
    .string()
    .url({ message: "Invalid canonical URL." })
    .optional(),
  og: SEOOgSchema.optional(),
  twitter: SEOTwitterSchema.optional(),
  hrefLangs: z.array(SEOHrefLangSchema).optional(),
  faviconURL: z.string().url({ message: "Invalid favicon URL." }).optional(),
  additionalMeta: z.array(SEOAdditionalMetaSchema).optional(),
  robotsAdvanced: SEORobotsAdvancedSchema.optional(),
  structuredData: z.any().optional(),
  socialMedia: z
    .object({
      facebook: z
        .object({
          appId: z.string().optional(),
        })
        .optional(),
      twitter: z
        .object({
          site: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});
