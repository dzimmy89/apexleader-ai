import type { MetadataRoute } from "next";
import { hasPublishedSiteTestimonials } from "@/content/testimonials";
import { allLessons, getCoursesInOrder } from "@/lib/learn/catalog";
import { absoluteUrl } from "@/lib/seo/site-url";

const CORE_PATHS = [
  "/",
  "/about",
  "/skool",
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
  const paths: string[] = [...CORE_PATHS];
  if (hasPublishedSiteTestimonials()) {
    paths.push("/testimonials");
  }
  return [...paths, ...universityPaths()];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPaths().map((path) => ({ url: absoluteUrl(path) }));
}
