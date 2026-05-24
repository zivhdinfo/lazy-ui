import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentDetail } from "@/components/lazy/component-detail";
import { DocsShell } from "@/components/lazy/docs-shell";
import {
  getComponentBySlug,
  getPublishedComponentsOnly,
} from "@/registry/components";
import { getComponentSource } from "@/registry/sources";

type ComponentDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPublishedComponentsOnly().map((component) => ({
    slug: component.slug,
  }));
}

export async function generateMetadata({
  params,
}: ComponentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    return {
      title: "Component not found | Lazy-ui",
    };
  }

  return {
    title: `${component.title} | Lazy-ui`,
    description: component.description,
  };
}

export default async function ComponentDetailPage({
  params,
}: ComponentDetailPageProps) {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component || component.status !== "published" || component.kind === "block") {
    notFound();
  }

  const source = getComponentSource(component.target);

  return (
    <div className="lazy-root">
      <DocsShell>
        <ComponentDetail component={component} source={source} />
      </DocsShell>
    </div>
  );
}
