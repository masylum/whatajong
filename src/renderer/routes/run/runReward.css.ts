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
import { createVar, keyframes, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"
import { COMBO_ANIMATION_DURATION } from "./runGame.css"

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
    [mediaQuery({ p: "m", l: "m" })]: {
      padding: 32,
      gap: 16,
    },
    [mediaQuery({ p: "l", l: "l" })]: {
      padding: 48,
      gap: 24,
    },
    [mediaQuery({ p: "xl", l: "xl" })]: {
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
    [mediaQuery({ p: "m", l: "m" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "l", l: "l" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "xl", l: "xl" })]: {
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
  "@media": {
    [mediaQuery({ p: "m", l: "m" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "l", l: "l" })]: {
      ...fontSize.h2,
    },
  },
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
        filter: "brightness(0.8)",
        opacity: 0.4,
      },
    },
  },
})

export const buttonContainerClass = style({
  marginTop: 8,
})

const shakeIntensity = createVar()

const shakeAnimation = keyframes({
  "0%, 100%": { transform: "translate(0, 0)" },
  "25%": {
    transform: `translate(calc(${shakeIntensity} * -1px), calc(${shakeIntensity} * 1px))`,
  },
  "50%": {
    transform: `translate(calc(${shakeIntensity} * 1px), calc(${shakeIntensity} * -1px))`,
  },
  "75%": {
    transform: `translate(calc(${shakeIntensity} * -1px), calc(${shakeIntensity} * -1px))`,
  },
})

export const sandboxClass = recipe({
  base: {
    vars: {
      [shakeIntensity]: "7",
    },
    padding: 32,
    paddingTop: 64,
    position: "relative",
    display: "flex",
    gap: 24,
    justifyContent: "center",
    backgroundColor: alpha(color.dot30, 0.1),
    borderRadius: 8,
    margin: "0 auto",
    overflow: "hidden",
    animation: `${shakeAnimation} ${COMBO_ANIMATION_DURATION}ms cubic-bezier(.36,.07,.19,.97)`,
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        padding: 40,
        paddingTop: 72,
      },
    },
  },
  variants: {
    comboAnimation: {
      0: { vars: { [shakeIntensity]: "0" }, animation: "none" },
      1: { vars: { [shakeIntensity]: "1" } },
      2: { vars: { [shakeIntensity]: "2" } },
      3: { vars: { [shakeIntensity]: "3" } },
      4: { vars: { [shakeIntensity]: "4" } },
      5: { vars: { [shakeIntensity]: "5" } },
      6: { vars: { [shakeIntensity]: "6" } },
      7: { vars: { [shakeIntensity]: "7" } },
    },
  },
})

export const sandboxContentClass = style({
  position: "relative",
  zIndex: 3,
})

export const endConditionClass = recipe({
  base: {
    position: "absolute",
    inset: 0,
    borderRadius: 8,
    backgroundColor: alpha(color.bam30, 0.1),
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 12,
    animation: `${fromAboveAnimation} ${ANIMATION_SLOW} ${easeBounce}`,
  },
  variants: {
    type: {
      win: {
        backgroundColor: alpha(color.bam40, 0.8),
        color: color.bam90,
      },
      lose: {
        backgroundColor: alpha(color.crack40, 0.8),
        color: color.crack90,
      },
    },
  },
})

export const endConditionTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero4,
    },
  },
})
export const endConditionButtonClass = style({
  border: "none",
  fontFamily: primary,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: 8,
  borderRadius: 8,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  selectors: {
    [`${endConditionClass.classNames.variants.type.win} &`]: {
      backgroundColor: alpha(color.bam20, 0.6),
      color: color.bam90,
    },
    [`${endConditionClass.classNames.variants.type.lose} &`]: {
      backgroundColor: alpha(color.crack20, 0.6),
      color: color.crack90,
    },
  },
})

export const pillsClass = style({
  zIndex: 3,
})
