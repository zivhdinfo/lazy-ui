import type { ComponentType, ReactNode } from "react";

import type { CustomizeValues } from "../customize";

// component/
import { Preview as AnimatedTabs } from "./component/animated-tabs/preview";
import { Preview as AnimateTooltip } from "./component/animate-tooltip/preview";
import { Preview as Checkbox } from "./component/checkbox/preview";
import { Preview as CopyButton } from "./component/copy-button/preview";
import { Preview as GlassButton } from "./component/glass-button/preview";
import { Preview as GithubStarsButton } from "./component/github-stars-button/preview";
import { Preview as Progress } from "./component/progress/preview";
import { Preview as Switch } from "./component/switch/preview";

// animate/
import { Preview as BlingTransition } from "./animate/bling-transition/preview";
import { Preview as CircleCipher } from "./animate/circle-cipher/preview";
import { Preview as Counter } from "./animate/counter/preview";
import { Preview as LiquidReveal } from "./animate/liquid-reveal/preview";
import { Preview as LiquidTransition } from "./animate/liquid-transition/preview";
import { Preview as MatrixGrid } from "./animate/matrix-grid/preview";
import { Preview as ParticleHalo } from "./animate/particle-halo/preview";
import { Preview as RevealAnimate } from "./animate/reveal-animate/preview";
import { Preview as StackList } from "./animate/stack-list/preview";

// text-animate/
import { Preview as ShinyText } from "./text-animate/shiny-text/preview";
import { Preview as SpinningText } from "./text-animate/spinning-text/preview";
import { Preview as TextFlip } from "./text-animate/text-flip/preview";
import { Preview as TextRise } from "./text-animate/text-rise/preview";
import { Preview as TextScramble } from "./text-animate/text-scramble/preview";
import { Preview as TextSpin } from "./text-animate/text-spin/preview";
import { Preview as TextWarp } from "./text-animate/text-warp/preview";

// device-mocks/
import { Preview as Iphone } from "./device-mocks/iphone/preview";

// blocks/
import { Preview as Pricing1 } from "./blocks/pricing-1/preview";
import { Preview as Pricing2 } from "./blocks/pricing-2/preview";
import { Preview as Pricing3 } from "./blocks/pricing-3/preview";
import { Preview as Pricing4 } from "./blocks/pricing-4/preview";
import { Preview as Pricing5 } from "./blocks/pricing-5/preview";

// background/
import { Preview as AuroraMesh } from "./background/aurora-mesh/preview";
import { Preview as ChromaFlow } from "./background/chroma-flow/preview";
import { Preview as GridBackground } from "./background/grid-background/preview";
import { Preview as HorizonCipher } from "./background/horizon-cipher/preview";
import { Preview as LiquidChrome } from "./background/liquid-chrome/preview";
import { Preview as OrbitBloom } from "./background/orbit-bloom/preview";
import { Preview as OrbitCipher } from "./background/orbit-cipher/preview";
import { Preview as Neumorphism } from "./background/neumorphism/preview";
import { Preview as OrbitMesh } from "./background/orbit-mesh/preview";
import { Preview as PrismDrift } from "./background/prism-drift/preview";
import { Preview as RippleSurface } from "./background/ripple-surface/preview";
import { Preview as ShadowMesh } from "./background/shadow-mesh/preview";
import { Preview as SlimeBackground } from "./background/slime-background/preview";
import { Preview as WaveCipher } from "./background/wave-cipher/preview";

type PreviewComponent = ComponentType<{ values: CustomizeValues }>;

const PREVIEWS: Record<string, PreviewComponent> = {
  // component/
  "animated-tabs": AnimatedTabs,
  "animate-tooltip": AnimateTooltip,
  checkbox: Checkbox,
  "copy-button": CopyButton,
  "glass-button": GlassButton,
  "github-stars-button": GithubStarsButton,
  progress: Progress,
  switch: Switch,
  // animate/
  "bling-transition": BlingTransition,
  "circle-cipher": CircleCipher,
  counter: Counter,
  "liquid-reveal": LiquidReveal,
  "liquid-transition": LiquidTransition,
  "matrix-grid": MatrixGrid,
  "particle-halo": ParticleHalo,
  "reveal-animate": RevealAnimate,
  "stack-list": StackList,
  // text-animate/
  "shiny-text": ShinyText,
  "spinning-text": SpinningText,
  "text-flip": TextFlip,
  "text-rise": TextRise,
  "text-scramble": TextScramble,
  "text-spin": TextSpin,
  "text-warp": TextWarp,
  // device-mocks/
  iphone: Iphone,
  // blocks/
  "pricing-1": Pricing1,
  "pricing-2": Pricing2,
  "pricing-3": Pricing3,
  "pricing-4": Pricing4,
  "pricing-5": Pricing5,
  // background/
  "aurora-mesh": AuroraMesh,
  "chroma-flow": ChromaFlow,
  "grid-background": GridBackground,
  "horizon-cipher": HorizonCipher,
  "liquid-chrome": LiquidChrome,
  "orbit-bloom": OrbitBloom,
  "orbit-cipher": OrbitCipher,
  "orbit-mesh": OrbitMesh,
  neumorphism: Neumorphism,
  "prism-drift": PrismDrift,
  "ripple-surface": RippleSurface,
  "shadow-mesh": ShadowMesh,
  "slime-background": SlimeBackground,
  "wave-cipher": WaveCipher,
};

export function LivePreview({
  slug,
  values,
}: {
  slug: string;
  values: CustomizeValues;
}): ReactNode {
  const PreviewFor = PREVIEWS[slug];
  return PreviewFor ? (
    <PreviewFor values={values} />
  ) : (
    <p style={{ color: "var(--fg-3)", fontSize: 13 }}>No preview.</p>
  );
}
