import { IImage } from "./image";

export interface ISEO {
  title?: string; // SEO page title displayed in browser and search results
  description?: string; // Meta description for search engine snippets
  keywords?: string[]; // List of SEO keywords relevant to the page
  robots?: string; // Robots meta tag, e.g., "index, follow" to control crawling
  image?: IImage; // Featured image for SEO and social sharing previews
  canonicalURL?: string; // Canonical URL to prevent duplicate content issues
  og?: {
    // Open Graph meta tags for enhanced social media sharing
    type?: string; // Open Graph type, e.g., "article", "website"
    title?: string; // Open Graph title for social platforms
    description?: string; // Open Graph description for social platforms
    image?: IImage; // Open Graph image for social platforms
  };
  twitter?: {
    // Twitter Card meta tags for Twitter-specific sharing
    card?: string; // Twitter card type, e.g., "summary", "summary_large_image"
    title?: string; // Twitter card title
    description?: string; // Twitter card description
    image?: IImage; // Twitter card image
    site?: string; // Twitter site username, e.g., "@example"
  };
  hrefLangs?: Array<{
    // Alternate language URLs for multilingual SEO
    href: string; // URL for the alternate language version
    hreflang: string; // Language code, e.g., "en", "fr"
  }>;
  faviconURL?: string; // URL of the favicon for the website
  additionalMeta?: Array<{
    // Additional meta tags for extended SEO needs
    name: string; // Meta tag name, e.g., "viewport", "theme-color"
    content: string; // Meta tag content
  }>;
  robotsAdvanced?: {
    // Advanced robots settings for finer control
    noarchive?: boolean; // Prevents search engines from caching the page
    nosnippet?: boolean; // Prevents search engines from showing snippets
    notranslate?: boolean; // Prevents search engines from offering translation
  };
  structuredData?: any; // Structured data (e.g., JSON-LD) for rich search results
  socialMedia?: {
    // Additional social media meta configurations
    facebook?: {
      appId?: string; // Facebook App ID for enhanced integrations
    };
    twitter?: {
      site?: string; // Twitter username, e.g., "@example"
    };
  };
}
