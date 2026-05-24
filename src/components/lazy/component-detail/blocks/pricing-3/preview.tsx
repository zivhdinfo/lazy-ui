import { Pricing3 } from "@/components/lazy-ui/blocks/pricing-3";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <div className="w-full self-stretch">
      <Pricing3 featuredIndex={(values.featuredIndex ?? 1) as number} />
    </div>
  );
}
