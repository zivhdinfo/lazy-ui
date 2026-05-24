import type { CustomizeControl } from "../../../customize";
import { slider } from "../../controls";

export const customize: CustomizeControl[] = [
  slider("featuredIndex", "Featured tier", {
    min: 0,
    max: 2,
    step: 1,
    defaultValue: 1,
    format: (n) => (["1st", "2nd", "3rd"][n] ?? `${n + 1}`),
  }),
];
