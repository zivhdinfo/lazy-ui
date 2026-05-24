import type { CustomizeControl } from "../../../customize";
import { select, toggle } from "../../controls";

export const customize: CustomizeControl[] = [
  select(
    "checked",
    "State",
    [
      { value: "unchecked", label: "Unchecked" },
      { value: "checked", label: "Checked" },
      { value: "indeterminate", label: "Indeterminate" },
    ],
    "unchecked",
  ),
  toggle("disabled", "Disabled", false),
];
