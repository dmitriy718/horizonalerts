import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://horizonsvc.com";
  const routes = [
    "",
    "/pricing",
    "/academy",
    "/blog",
    "/trust-safety",
    "/contact",
    "/privacy",
    "/terms"
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date()
  }));
}
