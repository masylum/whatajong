import {
  ANIMATION_SLOW,
  easeBounce,
  floatAnimation,
  fromAboveAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { keyframes, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  height: "100dvh",
  width: "100dvw",
  background: 'url("/halftone.png")',
})

export const contentClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  gap: 12,
  boxSizing: "border-box",
  background: `linear-gradient(to bottom, ${alpha(color.dot60, 0.1)}, ${alpha(color.dot60, 0.3)})`,
  color: color.dot30,
  textAlign: "center",
  width: "100%",
  height: "100%",
  animation: `${fromAboveAnimation} ${ANIMATION_SLOW} ${easeBounce}`,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 32,
      gap: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      padding: 48,
      gap: 24,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      padding: 64,
      gap: 32,
    },
  },
})

export const titleClass = style({
  ...fontSize.h2,
  color: color.dot40,
  fontFamily: primary,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.hero3,
    },
  },
})

export const subtitleClass = style([
  titleClass,
  {
    color: color.dot50,
  },
])

export const columnsClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 20,
  fontFamily: secondary,
  minHeight: 0,
})

export const explanationClass = style({
  ...fontSize.l,
  lineHeight: 1.5,
  textAlign: "left",
})

export const tilesContainerClass = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 24,
})

const pulseSelected = keyframes({
  "0%": {
    transform: "translateY(0px) rotate(0deg)",
  },
  "50%": {
    transform: "translateY(-15px) rotate(5deg)",
  },
  "100%": {
    transform: "translateY(0px) rotate(0deg)",
  },
})

export const floatingTileClass = recipe({
  base: {
    selectors: {
      // Add staggered delay for a nicer effect
      "&:nth-child(2n)": {
        animationDelay: "-2s",
      },
      "&:nth-child(3n)": {
        animationDelay: "-1s",
      },
      "&:nth-child(4n)": {
        animationDelay: "-3s",
      },
    },
  },
  variants: {
    isSelected: {
      true: {
        animation: `${pulseSelected} 4s ease-in-out infinite`,
      },
      false: {
        animation: `${floatAnimation} 4s ease-in-out infinite`,
        opacity: 0.6,
      },
    },
  },
})

export const videoClass = style([
  {
    flex: 1,
    minHeight: 0,
    maxHeight: 600,
  },
])

export const buttonContainerClass = style({
  marginTop: 8,
})
