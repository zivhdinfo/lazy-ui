import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsTopicPage } from "@/components/lazy/docs-topic-page";
import { DOCS_TOPICS, getDocsTopic } from "@/components/lazy/docs-content";
import { DocsShell } from "@/components/lazy/docs-shell";

type DocsTopicRouteProps = {
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
}: DocsTopicRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getDocsTopic(slug);

  if (!topic) {
    return {
      title: "Docs not found | Lazy-ui",
    };
  }

  return {
    title: `${topic.title} | Lazy-ui`,
    description: topic.description,
  };
}

export default async function DocsTopicRoute({ params }: DocsTopicRouteProps) {
  const { slug } = await params;
  const topic = getDocsTopic(slug);

  if (!topic) {
    notFound();
  }

  return (
    <div className="lazy-root">
      <DocsShell>
        <DocsTopicPage topic={topic} />
      </DocsShell>
    </div>
  );
}
