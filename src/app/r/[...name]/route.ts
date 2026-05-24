import { NextResponse } from "next/server";

import {
  buildRegistryItemJson,
  getComponentBySlug,
  normalizeRegistryName,
} from "@/registry/components";
import { getComponentSource, getExtraFileSource } from "@/registry/sources";

type RegistryRouteContext = {
  params: Promise<{
    name: string[];
  }>;
};

export async function GET(_request: Request, context: RegistryRouteContext) {
  const { name } = await context.params;

  if (name.length !== 1) {
    return NextResponse.json(
      { error: "Registry item not found" },
      { status: 404 },
    );
  }

  const slug = normalizeRegistryName(name[0]);
  const component = getComponentBySlug(slug);

  if (!component || component.status !== "published") {
    return NextResponse.json(
      { error: "Registry item not found" },
      { status: 404 },
    );
  }

  const source = getComponentSource(component.target);
  const extraSources: Record<string, string> = {};
  for (const extra of component.extraFiles ?? []) {
    extraSources[extra.src] = getExtraFileSource(extra.src);
  }
  const json = buildRegistryItemJson(component, source, extraSources);

  return NextResponse.json(json, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
