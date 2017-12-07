/**
 * @interface SitemapEntryInterface
 */
export interface SitemapEntryInterface {
  url: string;
  priority: number;
  changefreq: string;
  lastmod?: string;
}
