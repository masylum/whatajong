import { getBackgroundSrc, getTextureSrc } from "@/assets/assets"
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
      0: { backgroundImage: `url(${getTextureSrc("0")})` },
      1: { backgroundImage: `url(${getTextureSrc("1")})` },
      2: { backgroundImage: `url(${getTextureSrc("2")})` },
      3: { backgroundImage: `url(${getTextureSrc("3")})` },
      4: { backgroundImage: `url(${getTextureSrc("4")})` },
      5: { backgroundImage: `url(${getTextureSrc("5")})` },
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
      0: { backgroundImage: `url(${getBackgroundSrc("0")})` },
      1: { backgroundImage: `url(${getBackgroundSrc("1")})` },
      2: { backgroundImage: `url(${getBackgroundSrc("2")})` },
      3: { backgroundImage: `url(${getBackgroundSrc("3")})` },
      4: { backgroundImage: `url(${getBackgroundSrc("4")})` },
      5: { backgroundImage: `url(${getBackgroundSrc("5")})` },
    },
  },
})
