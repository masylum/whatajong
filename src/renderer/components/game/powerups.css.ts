import { ANIMATION_SLOW } from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, fallbackVar, keyframes, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

const opacity = createVar()
const backgroundColor = createVar()

export const playerPowerupsClass = style({
  position: "absolute",
  inset: 0,
  zIndex: 2,
  pointerEvents: "none",
})

export const powerupRecipe = recipe({
  base: {
    display: "flex",
    padding: 12,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 8,
    height: "100%",
    width: "100%",
    position: "absolute",
    ":before": {
      content: '""',
      mixBlendMode: "color",
      position: "absolute",
      width: "100dvw",
      height: "100dvh",
      pointerEvents: "none",
      zIndex: -1,
      top: 0,
      background: `linear-gradient(
        rgb(from ${backgroundColor} r g b / ${fallbackVar(opacity, "1")}),
        rgba(from ${backgroundColor} r g b / 0%) 50%
      )`,
    },
  },
  variants: {
    size: {
      0: { vars: { [opacity]: "0.3" } },
      1: { vars: { [opacity]: "0.4" } },
      2: { vars: { [opacity]: "0.5" } },
      3: { vars: { [opacity]: "0.6" } },
      4: { vars: { [opacity]: "0.7" } },
      5: { vars: { [opacity]: "0.8" } },
      6: { vars: { [opacity]: "0.9" } },
    },
    hue: hueVariants((kolor) => ({
      vars: { [backgroundColor]: kolor(50) },
    })),
  },
})

const pulseAnimation = keyframes({
  "0%": { transform: "scale(0.98)" },
  "10%": { transform: "scale(1)" },
  "20%": { transform: "scale(0.98)" },
  "30%": { transform: "scale(1)" },
  "100%": { transform: "scale(0.98)" },
})

export const comboRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    ...fontSize.m,
    fontFamily: primary,
    fontWeight: "500",
    color: "white",
    paddingInline: 12,
    paddingBlock: 2,
    borderRadius: 12,
    animation: `${pulseAnimation} 1s ease-in-out infinite`,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        ...fontSize.s,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.m,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        ...fontSize.l,
      },
      [mediaQuery({ p: "xl", l: "l" })]: {
        ...fontSize.h3,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: alpha(kolor(40), 0.8),
      textShadow: `1px 1px 0px ${alpha(kolor(60), 0.5)}`,
      ":after": {
        background: alpha(kolor(70), 0.5),
      },
    })),
  },
})

export const comboMultiplierClass = style({
  ...fontSize.m,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.h1,
    },
  },
})

export const phoenixComboClass = style({
  ...fontSize.hero3,
  position: "absolute",
  transform: "translateY(-120%)",
  zIndex: -1,
  color: alpha(color.bone40, 0.5),
  fontFamily: primary,
  top: "37%",
  right: 20,
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero2,
    },
  },
})

const MUZZLE_SIZE = 256
const yOffset = createVar()
const animation = {
  "0%": {
    transform: `translate(0%, ${yOffset})`,
    opacity: 0.3,
  },
  "50%": {
    opacity: 1,
  },
  "100%": {
    transform: `translate(calc(${MUZZLE_SIZE}px * -16), ${yOffset})`,
    opacity: 0.3,
  },
}

function muzzleAnimation() {
  const animations = [keyframes(animation), keyframes(animation)]

  return Object.fromEntries(
    Array.from({ length: 7 }).map((_, i) => [
      i,
      {
        ":before": {
          animation: `${animations[i % 2]} ${ANIMATION_SLOW} steps(16)`,
        },
      },
    ]),
  )
}

export const muzzleClass = recipe({
  base: {
    height: MUZZLE_SIZE,
    width: MUZZLE_SIZE,
    overflow: "hidden",
    ":before": {
      position: "absolute",
      top: 0,
      left: 0,
      content: '""',
      backgroundImage: "url(./sprites/muzzle.webp)",
      height: MUZZLE_SIZE,
      width: MUZZLE_SIZE * 16,
    },
  },
  variants: {
    size: muzzleAnimation(),
    hue: {
      crack: {
        filter: "hue-rotate(260deg)",
      },
      bam: {
        filter: "hue-rotate(20deg)",
      },
      dot: {
        filter: "hue-rotate(140deg)",
      },
      black: {
        filter: "brightness(0.2)",
      },
    },
    direction: {
      left: {
        left: "30%",
        rotate: "180deg",
        vars: { [yOffset]: "40%" },
      },
      right: {
        right: "30%",
        vars: { [yOffset]: "-40%" },
      },
    },
  },
  defaultVariants: {
    size: 0,
  },
})
