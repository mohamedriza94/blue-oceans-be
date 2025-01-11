import { ImageSchema } from "./image-schema";

export const SEOSchema = {
  title: { type: String },
  description: { type: String },
  keywords: [{ type: String }],
  robots: { type: String },
  image: { type: Object },
  canonicalURL: { type: String },
  og: {
    type: { type: String },
    title: { type: String },
    description: { type: String },
    image: ImageSchema,
  },
  twitter: {
    card: { type: String },
    title: { type: String },
    description: { type: String },
    image: ImageSchema,
    site: { type: String },
  },
  hrefLangs: [
    {
      href: { type: String },
      hreflang: { type: String },
      _id: false
    },
  ],
  faviconURL: { type: String },
  additionalMeta: [
    {
      name: { type: String },
      content: { type: String },
      _id: false
    },
  ],
  robotsAdvanced: {
    noarchive: { type: Boolean },
    nosnippet: { type: Boolean },
    notranslate: { type: Boolean },
  },
  structuredData: { type: Object },
  socialMedia: {
    facebook: {
      appId: { type: String },
    },
    twitter: {
      site: { type: String },
    },
  },
};
