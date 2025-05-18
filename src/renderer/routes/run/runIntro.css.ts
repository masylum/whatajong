import {
  ANIMATION_SLOW,
  easeBounce,
  fromAboveAnimation,
  mildFloatAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  height: "100dvh",
  width: "100dvw",
  background: 'url("/textures/2.webp")',
})

export const contentClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  background: `linear-gradient(to bottom, ${alpha(color.dot60, 0.1)}, ${alpha(color.dot60, 0.3)})`,
  position: "relative",
  padding: 12,
  gap: 32,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 64,
      padding: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      padding: 32,
    },
  },
})

export const subtitleContainerClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxWidth: 600,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 32,
    },
  },
})

export const backButtonClass = style({
  position: "absolute",
  top: 12,
  left: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "s" })]: {
      top: 32,
      left: 32,
    },
  },
})

export const titleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  color: color.dot40,
  fontVariantLigatures: "none",
  textAlign: "center",
  animationName: fromAboveAnimation,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  animationTimingFunction: easeBounce,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero3,
    },
  },
})

export const subtitleClass = recipe({
  base: {
    ...fontSize.l,
    fontFamily: secondary,
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: 12,
    borderRadius: 8,
    animationName: fromAboveAnimation,
    animationDuration: ANIMATION_SLOW,
    animationFillMode: "backwards",
    animationTimingFunction: easeBounce,
    selectors: {
      // Add staggered delay for a nicer effect
      "&:nth-child(1n)": {
        animationDelay: "200ms",
      },
      "&:nth-child(2n)": {
        animationDelay: "400ms",
      },
      "&:nth-child(3n)": {
        animationDelay: "600ms",
      },
    },
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.h3,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        ...fontSize.h2,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(30),
      backgroundColor: alpha(kolor(50), 0.1),
    })),
  },
})

export const tileClass = recipe({
  base: {
    position: "relative",
    animation: `${mildFloatAnimation} 3s ease-in-out infinite`,
  },
  variants: {
    stagger: {
      1: { animationDelay: "-2s" },
      2: { animationDelay: "-1s" },
      3: { animationDelay: "-3s" },
    },
  },
})
