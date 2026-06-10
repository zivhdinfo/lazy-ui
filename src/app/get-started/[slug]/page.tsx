import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChangelogPage } from "@/components/lazy/changelog-page";
import { DOCS_TOPICS, getDocsTopic } from "@/components/lazy/docs-content";
import { DocsTopicPage } from "@/components/lazy/docs-topic-page";

type GetStartedTopicRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return DOCS_TOPICS.map((topic) => ({
    slug: topic.slug,
  }));
}

export async function generateMetadata({
  params,
}: GetStartedTopicRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getDocsTopic(slug);

  if (!topic) {
    return { title: "Docs not found | Lazy-ui" };
  }

  return {
    title: `${topic.title} | Lazy-ui`,
    description: topic.description,
  };
}

export default async function GetStartedTopicRoute({
  params,
}: GetStartedTopicRouteProps) {
  const { slug } = await params;
  const topic = getDocsTopic(slug);

  if (!topic) {
    notFound();
  }

  // Chrome (sidebar + header) lives in get-started/layout.tsx. The changelog
  // gets a dedicated dated layout; every other topic uses the generic template.
  if (slug === "changelog") {
    return <ChangelogPage topic={topic} />;
  }

  return <DocsTopicPage topic={topic} />;
}
