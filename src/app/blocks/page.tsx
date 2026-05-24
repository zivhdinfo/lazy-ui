import { BlocksGallery } from "@/components/lazy/blocks-gallery";
import { BlocksShell } from "@/components/lazy/blocks-shell";
import { getPublishedBlocks } from "@/registry/components";

export const metadata = {
  title: "Blocks | Lazy-ui",
  description:
    "Clean, modern building blocks. Copy and paste into your apps. Works with all React frameworks. Open Source. Free forever.",
};

export default function BlocksPage() {
  const blocks = getPublishedBlocks();
  return (
    <div className="lazy-root">
      <BlocksShell>
        <BlocksGallery items={blocks} />
      </BlocksShell>
    </div>
  );
}
