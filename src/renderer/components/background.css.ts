import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const backgroundClass = style({
  position: "relative",
  height: "100dvh",
  width: "100dvw",
  overflow: "hidden",
})

export const textureClass = recipe({
  base: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    mixBlendMode: "overlay",
    pointerEvents: "none",
  },
  variants: {
    filter: {
      r: { filter: "hue-rotate(300deg) saturate(0.9)" },
      b: { filter: "hue-rotate(160deg) saturate(0.4)" },
      g: { filter: "hue-rotate(50deg) saturate(0.6)" },
      k: { filter: "saturate(0.6) sepia(0.1) brightness(0.99)" },
    },
    num: {
      0: { backgroundImage: "url(/textures/0.webp)" },
      1: { backgroundImage: "url(/textures/1.webp)" },
      2: { backgroundImage: "url(/textures/2.webp)" },
      3: { backgroundImage: "url(/textures/3.webp)" },
      4: { backgroundImage: "url(/textures/4.webp)" },
      5: { backgroundImage: "url(/textures/5.webp)" },
    },
  },
})

export const containerClass = style({
  position: "absolute",
  inset: 0,
  zIndex: 3,
})

export const mountainsClass = recipe({
  base: {
    position: "fixed",
    inset: 0,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    maskImage:
      "radial-gradient(ellipse min(700px, 60dvh) min(500px, 40dvh) at center, black, transparent 90%)",
    zIndex: 2,
    mixBlendMode: "color-burn",
    pointerEvents: "none",
  },
  variants: {
    num: {
      0: { backgroundImage: "url(/backgrounds/0.webp)" },
      1: { backgroundImage: "url(/backgrounds/1.webp)" },
      2: { backgroundImage: "url(/backgrounds/2.webp)" },
      3: { backgroundImage: "url(/backgrounds/3.webp)" },
      4: { backgroundImage: "url(/backgrounds/4.webp)" },
      5: { backgroundImage: "url(/backgrounds/5.webp)" },
    },
  },
})
