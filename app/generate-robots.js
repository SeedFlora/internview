import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const siteUrl = process.env.VITE_SITE_URL;

if (!siteUrl) {
  throw new Error("VITE_SITE_URL is not defined");
}

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync("public/robots.txt", robots);

// BUG FIX: robots.txt advertised ${siteUrl}/sitemap.xml but nothing ever
// generated it, so every crawl 404'd the sitemap and Search Console reported a
// persistent "Couldn't fetch" error. Emit a sitemap of the static public
// routes. (Dynamic company pages are not enumerable at build time.)
const publicRoutes = ["/", "/companies", "/categories", "/compare", "/faq", "/contact"];
const today = new Date().toISOString().split("T")[0];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) =>
      `  <url>\n    <loc>${siteUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync("public/sitemap.xml", sitemap);

console.log("robots.txt and sitemap.xml generated");