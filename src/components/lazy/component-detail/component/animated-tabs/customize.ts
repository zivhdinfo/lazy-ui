import type { CustomizeControl } from "../../../customize";
import { select } from "../../controls";

export const customize: CustomizeControl[] = [
  select(
    "animate",
    "Animate",
    [
      { value: "basic", label: "Basic" },
      { value: "blur", label: "Blur" },
    ],
    "basic",
  ),
];
