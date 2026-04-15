import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/_next/",
        "/dashboard/*/settings",
        "/admin/",
      ],
    },
    sitemap: "https://letask2.onrender.com/sitemap.xml",
    host: "https://letask2.onrender.com",
  };
}
