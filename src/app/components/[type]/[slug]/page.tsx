import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentView } from "@/components/lazy/component-view/component-view";
import { typeForCategory } from "@/registry/categories";
import {
  getComponentBySlug,
  getPublishedComponentsOnly,
} from "@/registry/components";
import { getComponentSource } from "@/registry/sources";

type ComponentDetailPageProps = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPublishedComponentsOnly().map((component) => ({
    type: typeForCategory(component.category),
    slug: component.slug,
  }));
}

export async function generateMetadata({
  params,
}: ComponentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    return { title: "Component not found | Lazy-ui" };
  }

  return {
    title: `${component.title} | Lazy-ui`,
    description: component.description,
  };
}

export default async function ComponentDetailPage({
  params,
}: ComponentDetailPageProps) {
  const { type, slug } = await params;
  const component = getComponentBySlug(slug);

  // 404 on anything that isn't a published component reached through its own
  // category type — a mistyped type segment falls through cleanly (no redirect).
  if (
    !component ||
    component.status !== "published" ||
    component.kind === "block" ||
    typeForCategory(component.category) !== type
  ) {
    notFound();
  }

  const source = getComponentSource(component.target);

  // Chrome lives in components/layout.tsx; render only the detail content.
  // ComponentView (client) resolves its own config by slug — the config holds
  // functions that can't cross the server→client boundary as props.
  return <ComponentView component={component} source={source} />;
}
