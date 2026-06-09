import { LazyApp } from "@/components/lazy/app";
import { getPublishedComponents } from "@/registry/components";
import { getComponentSource } from "@/registry/sources";

export default function DocsPage() {
  const sources = Object.fromEntries(
    getPublishedComponents().map((c) => [c.slug, getComponentSource(c.target)]),
  );
  return <LazyApp sources={sources} />;
}
