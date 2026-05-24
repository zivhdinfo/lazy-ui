import type { CustomizeControl } from "../../../customize";
import { slider } from "../../controls";

export const customize: CustomizeControl[] = [
  slider("defaultTier", "Starting tier", {
    min: 0,
    max: 5,
    step: 1,
    defaultValue: 2,
    format: (n) =>
      (["Free", "Starter", "Team", "Scale", "Business", "Enterprise"][n] ??
        `${n}`),
  }),
];
