import type { MetadataRoute } from "next";
import { allLessons, getCoursesInOrder } from "@/lib/learn/catalog";
import { absoluteUrl } from "@/lib/seo/site-url";

const CORE_PATHS = [
  "/",
  "/about",
  "/university",
  "/coaching",
  "/coaching/pay",
  "/privacy",
  "/terms",
] as const;

function universityPaths(): string[] {
  return getCoursesInOrder().flatMap((course) => [
    `/university/${course.id}`,
    ...allLessons(course).map((lesson) => `/university/${course.id}/lessons/${lesson.slug}`),
  ]);
}

export function sitemapPaths(): string[] {
  return [...CORE_PATHS, ...universityPaths()];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPaths().map((path) => ({ url: absoluteUrl(path) }));
}
