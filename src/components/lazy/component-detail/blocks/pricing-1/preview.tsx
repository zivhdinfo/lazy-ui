import { Pricing1 } from "@/components/lazy-ui/blocks/pricing-1";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <div className="w-full self-stretch">
      <Pricing1 featuredIndex={(values.featuredIndex ?? 1) as number} />
    </div>
  );
}
