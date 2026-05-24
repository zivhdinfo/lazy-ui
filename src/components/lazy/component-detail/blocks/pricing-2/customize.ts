import type { CustomizeControl } from "../../../customize";
import { select } from "../../controls";

export const customize: CustomizeControl[] = [
  select(
    "period",
    "Billing",
    [
      { value: "yearly", label: "Annual" },
      { value: "monthly", label: "Monthly" },
    ],
    "yearly",
  ),
];
