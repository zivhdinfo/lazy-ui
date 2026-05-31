import type { ReactNode } from "react";

import type { CustomizeControl, CustomizeValues } from "../customize";

// component/
import { customize as animatedTabs } from "./component/animated-tabs/customize";
import { customize as animateTooltip } from "./component/animate-tooltip/customize";
import { customize as checkbox } from "./component/checkbox/customize";
import { customize as copyButton } from "./component/copy-button/customize";
import { customize as flipButton } from "./component/flip-button/customize";
import { customize as glassButton } from "./component/glass-button/customize";
import { customize as githubStarsButton } from "./component/github-stars-button/customize";
import { footer as githubStarsButtonFooter } from "./component/github-stars-button/footer";
import { customize as imageZoom } from "./component/image-zoom/customize";
import { customize as progress } from "./component/progress/customize";
import { customize as spectralCard } from "./component/spectral-card/customize";
import { customize as smoothCursor } from "./component/smooth-cursor/customize";
import { customize as springIconLoader } from "./component/spring-icon-loader/customize";
import { customize as switchCustomize } from "./component/switch/customize";

// animate/
import { customize as blingTransition } from "./animate/bling-transition/customize";
import { customize as circleCipher } from "./animate/circle-cipher/customize";
import { customize as counter } from "./animate/counter/customize";
import { customize as liquidReveal } from "./animate/liquid-reveal/customize";
import { customize as liquidTransition } from "./animate/liquid-transition/customize";
import { customize as matrixGrid } from "./animate/matrix-grid/customize";
import { customize as particleHalo } from "./animate/particle-halo/customize";
import { customize as revealAnimate } from "./animate/reveal-animate/customize";
import { customize as stackList } from "./animate/stack-list/customize";

// text-animate/
import { customize as shinyText } from "./text-animate/shiny-text/customize";
import { customize as spinningText } from "./text-animate/spinning-text/customize";
import { customize as textFlip } from "./text-animate/text-flip/customize";
import { customize as textRise } from "./text-animate/text-rise/customize";
import { customize as textScramble } from "./text-animate/text-scramble/customize";
import { customize as textSpin } from "./text-animate/text-spin/customize";
import { customize as textWarp } from "./text-animate/text-warp/customize";

// device-mocks/
import { customize as iphone } from "./device-mocks/iphone/customize";

// blocks/
import { customize as pricing1 } from "./blocks/pricing-1/customize";
import { customize as pricing2 } from "./blocks/pricing-2/customize";
import { customize as pricing3 } from "./blocks/pricing-3/customize";
import { customize as pricing5 } from "./blocks/pricing-5/customize";

// background/
import { customize as auroraMesh } from "./background/aurora-mesh/customize";
import { customize as chromaFlow } from "./background/chroma-flow/customize";
import { customize as gridBackground } from "./background/grid-background/customize";
import { customize as horizonCipher } from "./background/horizon-cipher/customize";
import { customize as liquidChrome } from "./background/liquid-chrome/customize";
import { customize as orbitBloom } from "./background/orbit-bloom/customize";
import { customize as orbitCipher } from "./background/orbit-cipher/customize";
import { customize as neumorphism } from "./background/neumorphism/customize";
import { customize as orbitMesh } from "./background/orbit-mesh/customize";
import { customize as prismDrift } from "./background/prism-drift/customize";
import { customize as rippleSurface } from "./background/ripple-surface/customize";
import { customize as shadowMesh } from "./background/shadow-mesh/customize";
import { customize as slimeBackground } from "./background/slime-background/customize";
import { customize as waveCipher } from "./background/wave-cipher/customize";

export const CUSTOM_CONFIGS: Record<string, CustomizeControl[]> = {
  // component/
  "animated-tabs": animatedTabs,
  "animate-tooltip": animateTooltip,
  checkbox,
  "copy-button": copyButton,
  "flip-button": flipButton,
  "glass-button": glassButton,
  "github-stars-button": githubStarsButton,
  "image-zoom": imageZoom,
  progress,
  "spectral-card": spectralCard,
  "smooth-cursor": smoothCursor,
  "spring-icon-loader": springIconLoader,
  switch: switchCustomize,
  // animate/
  "bling-transition": blingTransition,
  "circle-cipher": circleCipher,
  counter,
  "liquid-reveal": liquidReveal,
  "liquid-transition": liquidTransition,
  "matrix-grid": matrixGrid,
  "particle-halo": particleHalo,
  "reveal-animate": revealAnimate,
  "stack-list": stackList,
  // text-animate/
  "shiny-text": shinyText,
  "spinning-text": spinningText,
  "text-flip": textFlip,
  "text-rise": textRise,
  "text-scramble": textScramble,
  "text-spin": textSpin,
  "text-warp": textWarp,
  // device-mocks/
  iphone,
  // blocks/
  "pricing-1": pricing1,
  "pricing-2": pricing2,
  "pricing-3": pricing3,
  "pricing-5": pricing5,
  // background/
  "aurora-mesh": auroraMesh,
  "chroma-flow": chromaFlow,
  "grid-background": gridBackground,
  "horizon-cipher": horizonCipher,
  "liquid-chrome": liquidChrome,
  "orbit-bloom": orbitBloom,
  "orbit-cipher": orbitCipher,
  "orbit-mesh": orbitMesh,
  neumorphism,
  "prism-drift": prismDrift,
  "ripple-surface": rippleSurface,
  "shadow-mesh": shadowMesh,
  "slime-background": slimeBackground,
  "wave-cipher": waveCipher,
};

export function customConfigFor(slug: string): CustomizeControl[] | undefined {
  return CUSTOM_CONFIGS[slug];
}

/**
 * Per-slug "footer" — extra panel rendered below the Customize controls for
 * inputs the standard slider/select/toggle vocabulary can't express (e.g. a
 * GitHub username/repo text input). `defaults` are seeded into the customize
 * values map so the preview can read them without special-casing.
 */
export type CustomFooter = {
  defaults: Record<string, number | string | boolean>;
  render: (
    values: CustomizeValues,
    onChange: (key: string, value: number | string | boolean) => void,
  ) => ReactNode;
};

const CUSTOM_FOOTERS: Record<string, CustomFooter> = {
  "github-stars-button": githubStarsButtonFooter,
};

export function customFooterFor(slug: string): CustomFooter | undefined {
  return CUSTOM_FOOTERS[slug];
}
