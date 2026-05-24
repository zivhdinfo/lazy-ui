import { Pricing5 } from "@/components/lazy-ui/blocks/pricing-5";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <div className="w-full self-stretch">
      <Pricing5 defaultTier={(values.defaultTier ?? 2) as number} />
    </div>
  );
}
