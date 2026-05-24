import type { CustomizeControl } from "../../../customize";
import { select, slider, toggle } from "../../controls";

export const customize: CustomizeControl[] = [
  slider("battery", "Battery", {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 82,
    format: (n) => `${Math.round(n)}%`,
  }),
  slider("signal", "Signal", {
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 4,
    format: (n) => `${Math.round(n)} / 4`,
  }),
  select(
    "bezelColor",
    "Frame",
    [
      { value: "#de7343", label: "Orange" },
      { value: "#a3a3a3", label: "Silver" },
      { value: "#6b6b6b", label: "Graphite" },
      { value: "#d4b073", label: "Gold" },
      { value: "#1f1f1f", label: "Black" },
      { value: "#f0f0f0", label: "White" },
    ],
    "#de7343",
  ),
  toggle("statusBar", "Status bar", true),
  toggle("batteryText", "Battery %", false),
  toggle("wifi", "Wifi", true),
  toggle("lockButtons", "Lock buttons", true),
  toggle("homeIndicator", "Home indicator", true),
];
