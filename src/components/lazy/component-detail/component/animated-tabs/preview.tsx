import type { AnimateMode } from "@/components/lazy-ui/animated-tabs";

import { AnimatedTabsDemo } from "../../../animated-tabs-demo";
import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  return (
    <AnimatedTabsDemo
      animate={(values.animate ?? "basic") as AnimateMode}
      className="w-full max-w-sm"
    />
  );
}
