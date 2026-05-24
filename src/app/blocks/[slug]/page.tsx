import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlocksShell } from "@/components/lazy/blocks-shell";
import { ComponentDetail } from "@/components/lazy/component-detail";
import {
  getBlockBySlug,
  getPublishedBlocks,
} from "@/registry/components";
import { getComponentSource } from "@/registry/sources";

type BlockDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPublishedBlocks().map((block) => ({
    slug: block.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlockDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const block = getBlockBySlug(slug);

  if (!block) {
    return {
      title: "Block not found | Lazy-ui",
    };
  }

  return {
    title: `${block.title} block | Lazy-ui`,
    description: block.description,
  };
}

export default async function BlockDetailPage({ params }: BlockDetailPageProps) {
  const { slug } = await params;
  const block = getBlockBySlug(slug);

  if (!block || block.status !== "published") {
    notFound();
  }

  const source = getComponentSource(block.target);

  return (
    <div className="lazy-root">
      <BlocksShell>
        <ComponentDetail component={block} source={source} />
      </BlocksShell>
    </div>
  );
}
