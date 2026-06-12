import {
  Iphone,
  type IphoneSignal,
} from "@/components/lazy-ui/device-mocks/iphone";
import { select, slider, toggle } from "@/components/lazy/component-detail/controls";
import type { ComponentView } from "@/components/lazy/component-view/types";

export const view: ComponentView = {
  load: () => import("@/components/lazy-ui/device-mocks/iphone"),
  export: "Iphone",
  stageMinHeight: 640,
  render: (v) => {
    const bezelColor = (v.bezelColor ?? "#de7343") as string;
    const statusBar = (v.statusBar ?? true) as boolean;
    const battery = (v.battery ?? 82) as number;
    const batteryText = (v.batteryText ?? false) as boolean;
    const signal = ((v.signal ?? 4) as number) as IphoneSignal;
    const wifi = (v.wifi ?? true) as boolean;
    const lockButtons = (v.lockButtons ?? true) as boolean;
    const homeIndicator = (v.homeIndicator ?? true) as boolean;
    return (
      <div className="flex min-h-[520px] w-full items-center justify-center px-6 py-6">
        <div style={{ width: 260 }}>
          <Iphone
            src="/ip.png"
            bezelColor={bezelColor}
            statusBar={statusBar}
            battery={battery}
            batteryText={batteryText}
            signal={signal}
            wifi={wifi}
            lockButtons={lockButtons}
            homeIndicator={homeIndicator}
          />
        </div>
      </div>
    );
  },
  controls: [
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
  ],
};
