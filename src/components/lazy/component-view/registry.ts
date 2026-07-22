import type { ComponentView } from "./types";

import { view as blingTransition } from "./configs/animate/bling-transition";
import { view as borderGlow } from "./configs/animate/border-glow";
import { view as circleCipher } from "./configs/animate/circle-cipher";
import { view as counter } from "./configs/animate/counter";
import { view as horizonGlow } from "./configs/animate/horizon-glow";
import { view as liquidReveal } from "./configs/animate/liquid-reveal";
import { view as liquidTransition } from "./configs/animate/liquid-transition";
import { view as matrixGrid } from "./configs/animate/matrix-grid";
import { view as pixelCursor } from "./configs/animate/pixel-cursor";
import { view as revealAnimate } from "./configs/animate/reveal-animate";
import { view as stackList } from "./configs/animate/stack-list";
import { view as auroraMesh } from "./configs/background/aurora-mesh";
import { view as pricing1 } from "./configs/blocks/pricing-1";
import { view as pricing2 } from "./configs/blocks/pricing-2";
import { view as pricing3 } from "./configs/blocks/pricing-3";
import { view as pricing4 } from "./configs/blocks/pricing-4";
import { view as pricing5 } from "./configs/blocks/pricing-5";
import { view as chromaFlow } from "./configs/background/chroma-flow";
import { view as gridBackground } from "./configs/background/grid-background";
import { view as horizonCipher } from "./configs/background/horizon-cipher";
import { view as liquidChrome } from "./configs/background/liquid-chrome";
import { view as orbitBloom } from "./configs/background/orbit-bloom";
import { view as orbitCipher } from "./configs/background/orbit-cipher";
import { view as orbitMesh } from "./configs/background/orbit-mesh";
import { view as prismDrift } from "./configs/background/prism-drift";
import { view as rippleSurface } from "./configs/background/ripple-surface";
import { view as slimeBackground } from "./configs/background/slime-background";
import { view as waveCipher } from "./configs/background/wave-cipher";
import { view as copyButton } from "./configs/buttons/copy-button";
import { view as flipButton } from "./configs/buttons/flip-button";
import { view as githubStarsButton } from "./configs/buttons/github-stars-button";
import { view as glassButton } from "./configs/buttons/glass-button";
import { view as gravityButton } from "./configs/buttons/gravity-button";
import { view as shimmerButton } from "./configs/buttons/shimmer-button";
import { view as imageZoom } from "./configs/effects/image-zoom";
import { view as scrollImageCarousel } from "./configs/effects/scroll-image-carousel";
import { view as smoothCursor } from "./configs/effects/smooth-cursor";
import { view as spectralCard } from "./configs/effects/spectral-card";
import { view as testimonialAccordion } from "./configs/effects/testimonial-accordion";
import { view as introPreloader } from "./configs/feedback/intro-preloader";
import { view as progress } from "./configs/feedback/progress";
import { view as springIconLoader } from "./configs/feedback/spring-icon-loader";
import { view as checkbox } from "./configs/forms/checkbox";
import { view as switchView } from "./configs/forms/switch";
import { view as iphone } from "./configs/device-mocks/iphone";
import { view as animatedTabs } from "./configs/navigation/animated-tabs";
import { view as slideHighlight } from "./configs/navigation/slide-highlight";
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
  "gravity-button": gravityButton,
  "grid-background": gridBackground,
  "horizon-cipher": horizonCipher,
  "horizon-glow": horizonGlow,
  "image-zoom": imageZoom,
  "intro-preloader": introPreloader,
  iphone: iphone,
  "liquid-chrome": liquidChrome,
  "liquid-reveal": liquidReveal,
  "liquid-transition": liquidTransition,
  "matrix-grid": matrixGrid,
  "orbit-bloom": orbitBloom,
  "orbit-cipher": orbitCipher,
  "orbit-mesh": orbitMesh,
  "pixel-cursor": pixelCursor,
  "pricing-1": pricing1,
  "pricing-2": pricing2,
  "pricing-3": pricing3,
  "pricing-4": pricing4,
  "pricing-5": pricing5,
  "prism-drift": prismDrift,
  progress: progress,
  "reveal-animate": revealAnimate,
  "ripple-surface": rippleSurface,
  "scroll-image-carousel": scrollImageCarousel,
  "shimmer-button": shimmerButton,
  "shiny-text": shinyText,
  "slide-highlight": slideHighlight,
  "slime-background": slimeBackground,
  "smooth-cursor": smoothCursor,
  "spectral-card": spectralCard,
  "spinning-text": spinningText,
  "spring-icon-loader": springIconLoader,
  "stack-list": stackList,
  switch: switchView,
  "testimonial-accordion": testimonialAccordion,
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
