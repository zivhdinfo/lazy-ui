import { Pricing2 } from "@/components/lazy-ui/blocks/pricing-2";
import type { PricingPeriod } from "@/components/lazy-ui/blocks/pricing-shared/pricing-shared";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <div className="w-full self-stretch">
      <Pricing2 period={(values.period ?? "yearly") as PricingPeriod} />
    </div>
  );
}
