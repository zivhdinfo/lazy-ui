import type { ComponentView } from "./types";

import { view as blingTransition } from "./configs/animate/bling-transition";
import { view as borderGlow } from "./configs/animate/border-glow";
import { view as circleCipher } from "./configs/animate/circle-cipher";
import { view as counter } from "./configs/animate/counter";
import { view as liquidReveal } from "./configs/animate/liquid-reveal";
import { view as liquidTransition } from "./configs/animate/liquid-transition";
import { view as matrixGrid } from "./configs/animate/matrix-grid";
import { view as particleHalo } from "./configs/animate/particle-halo";
import { view as pixelCursor } from "./configs/animate/pixel-cursor";
import { view as revealAnimate } from "./configs/animate/reveal-animate";
import { view as stackList } from "./configs/animate/stack-list";
import { view as auroraMesh } from "./configs/background/aurora-mesh";
import { view as chromaFlow } from "./configs/background/chroma-flow";
import { view as gridBackground } from "./configs/background/grid-background";
import { view as horizonCipher } from "./configs/background/horizon-cipher";
import { view as liquidChrome } from "./configs/background/liquid-chrome";
import { view as neumorphism } from "./configs/background/neumorphism";
import { view as orbitBloom } from "./configs/background/orbit-bloom";
import { view as orbitCipher } from "./configs/background/orbit-cipher";
import { view as orbitMesh } from "./configs/background/orbit-mesh";
import { view as prismDrift } from "./configs/background/prism-drift";
import { view as rippleSurface } from "./configs/background/ripple-surface";
import { view as shadowMesh } from "./configs/background/shadow-mesh";
import { view as slimeBackground } from "./configs/background/slime-background";
import { view as waveCipher } from "./configs/background/wave-cipher";
import { view as copyButton } from "./configs/buttons/copy-button";
import { view as flipButton } from "./configs/buttons/flip-button";
import { view as githubStarsButton } from "./configs/buttons/github-stars-button";
import { view as glassButton } from "./configs/buttons/glass-button";
import { view as imageZoom } from "./configs/effects/image-zoom";
import { view as smoothCursor } from "./configs/effects/smooth-cursor";
import { view as spectralCard } from "./configs/effects/spectral-card";
import { view as progress } from "./configs/feedback/progress";
import { view as springIconLoader } from "./configs/feedback/spring-icon-loader";
import { view as checkbox } from "./configs/forms/checkbox";
import { view as switchView } from "./configs/forms/switch";
import { view as iphone } from "./configs/device-mocks/iphone";
import { view as animatedTabs } from "./configs/navigation/animated-tabs";
import { view as animateTooltip } from "./configs/overlay/animate-tooltip";
import { view as shinyText } from "./configs/text-animate/shiny-text";
import { view as spinningText } from "./configs/text-animate/spinning-text";
import { view as textFlip } from "./configs/text-animate/text-flip";
import { view as textRise } from "./configs/text-animate/text-rise";
import { view as textScramble } from "./configs/text-animate/text-scramble";
import { view as textSpin } from "./configs/text-animate/text-spin";
import { view as textWarp } from "./configs/text-animate/text-warp";

// One line per migrated component. Components without an entry still get a full
// detail page (Code / Install / Props / Usage) — only the live preview shows a
// "coming soon" placeholder until a config lands here.
const VIEWS: Record<string, ComponentView> = {
  "animate-tooltip": animateTooltip,
  "animated-tabs": animatedTabs,
  "aurora-mesh": auroraMesh,
  "bling-transition": blingTransition,
  "border-glow": borderGlow,
  checkbox: checkbox,
  "chroma-flow": chromaFlow,
  "circle-cipher": circleCipher,
  counter: counter,
  "copy-button": copyButton,
  "flip-button": flipButton,
  "github-stars-button": githubStarsButton,
  "glass-button": glassButton,
  "grid-background": gridBackground,
  "horizon-cipher": horizonCipher,
  "image-zoom": imageZoom,
  iphone: iphone,
  "liquid-chrome": liquidChrome,
  "liquid-reveal": liquidReveal,
  "liquid-transition": liquidTransition,
  "matrix-grid": matrixGrid,
  neumorphism: neumorphism,
  "orbit-bloom": orbitBloom,
  "orbit-cipher": orbitCipher,
  "orbit-mesh": orbitMesh,
  "particle-halo": particleHalo,
  "pixel-cursor": pixelCursor,
  "prism-drift": prismDrift,
  progress: progress,
  "reveal-animate": revealAnimate,
  "ripple-surface": rippleSurface,
  "shadow-mesh": shadowMesh,
  "shiny-text": shinyText,
  "slime-background": slimeBackground,
  "smooth-cursor": smoothCursor,
  "spectral-card": spectralCard,
  "spinning-text": spinningText,
  "spring-icon-loader": springIconLoader,
  "stack-list": stackList,
  switch: switchView,
  "text-flip": textFlip,
  "text-rise": textRise,
  "text-scramble": textScramble,
  "text-spin": textSpin,
  "text-warp": textWarp,
  "wave-cipher": waveCipher,
};

export function viewFor(slug: string): ComponentView | undefined {
  return VIEWS[slug];
}
