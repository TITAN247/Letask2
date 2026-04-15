import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://letask2.onrender.com";

  // Static routes
  const routes = [
    "",
    "/login/mentee",
    "/login/prementor",
    "/login/promentor",
    "/signup/mentee",
    "/select-role",
    "/mentee",
    "/prementor",
    "/promentor",
    "/onboarding",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...routes];
}
