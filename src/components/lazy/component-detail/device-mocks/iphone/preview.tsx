import {
  Iphone,
  type IphoneSignal,
} from "@/components/lazy-ui/device-mocks/iphone";

import type { CustomizeValues } from "../../../customize";

export function Preview({ values }: { values: CustomizeValues }) {
  const bezelColor = (values.bezelColor ?? "#de7343") as string;
  const statusBar = (values.statusBar ?? true) as boolean;
  const battery = (values.battery ?? 82) as number;
  const batteryText = (values.batteryText ?? false) as boolean;
  const signal = ((values.signal ?? 4) as number) as IphoneSignal;
  const wifi = (values.wifi ?? true) as boolean;
  const lockButtons = (values.lockButtons ?? true) as boolean;
  const homeIndicator = (values.homeIndicator ?? true) as boolean;
  return (
    <div className="flex min-h-[520px] w-full items-center justify-center rounded-xl px-6 py-6">
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
}
