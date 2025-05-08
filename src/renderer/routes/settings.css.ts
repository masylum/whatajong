import {
  ANIMATION_SLOW,
  easeBounce,
  fromAboveAnimation,
} from "@/styles/animations.css"
import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { keyframes, style } from "@vanilla-extract/css"

export const containerClass = style({
  height: "100dvh",
  width: "100dvw",
  background: 'url("/halftone.png")',
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

export const sliderRootClass = style({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  userSelect: "none",
  touchAction: "none",
  width: 200,
  fontFamily: secondary,
})

export const sliderTrackClass = style({
  backgroundColor: color.dot30,
  position: "relative",
  borderRadius: 9999,
  height: 8,
  width: "100%",
})

export const sliderRangeClass = style({
  position: "absolute",
  backgroundColor: color.dot40,
  borderRadius: 9999,
  height: "100%",
})

export const sliderThumbClass = style({
  display: "block",
  width: 16,
  height: 16,
  backgroundColor: color.dot40,
  borderRadius: 9999,
  top: -4,
  ":hover": {
    boxShadow: `0 0 0 5px ${alpha(color.dot40, 0.6)}`,
  },
  ":focus": {
    outline: "none",
    boxShadow: `0 0 0 5px ${alpha(color.dot40, 0.6)}`,
  },
})

export const sliderLabelClass = style({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
})

const contentShow = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(-8px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
})

const contentHide = keyframes({
  from: {
    opacity: 1,
    transform: "translateY(0)",
  },
  to: {
    opacity: 0,
    transform: "translateY(-8px)",
  },
})

export const selectTriggerClass = style({
  display: "flex",
  alignItems: "center",
  fontFamily: secondary,
  justifyContent: "space-between",
  width: 200,
  borderRadius: 4,
  padding: 4,
  ...fontSize.l,
  lineHeight: 1,
  height: 40,
  outline: "none",
  backgroundColor: color.dot90,
  border: `1px solid ${color.dot40}`,
  color: color.dot40,
  transition: "border-color 250ms, color 250ms",
  ":hover": {
    borderColor: color.dot50,
  },
  ":focus-visible": {
    outline: `2px solid ${color.dot20}`,
    outlineOffset: 2,
  },
  selectors: {
    "&[data-invalid]": {
      borderColor: color.bam50,
      color: color.bam50,
    },
  },
})

export const selectValueClass = style({
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
})

export const selectIconClass = style({
  height: 20,
  width: 20,
  flex: "0 0 20px",
})

export const selectContentClass = style({
  backgroundColor: color.dot90,
  borderRadius: 4,
  border: `1px solid ${color.dot40}`,
  boxShadow: `0 4px 6px -1px ${alpha(color.dot40, 0.1)}, 0 2px 4px -2px ${alpha(color.dot40, 0.1)}`,
  transformOrigin: "var(--kb-select-content-transform-origin)",
  animation: `${contentHide} 250ms ease-in forwards`,
  selectors: {
    "&[data-expanded]": {
      animation: `${contentShow} 250ms ease-out`,
    },
  },
})

export const selectListboxClass = style({
  overflowY: "auto",
  maxHeight: 360,
  padding: 8,
})

export const selectItemClass = style({
  fontSize: 16,
  lineHeight: 1,
  fontFamily: secondary,
  color: color.dot40,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: 32,
  padding: "0 8px",
  position: "relative",
  userSelect: "none",
  outline: "none",
  selectors: {
    "&[data-disabled]": {
      color: color.dot50,
      opacity: 0.5,
      pointerEvents: "none",
    },
    "&[data-highlighted]": {
      outline: "none",
      backgroundColor: color.dot20,
      color: color.dot90,
    },
  },
})

export const selectItemIndicatorClass = style({
  height: 20,
  width: 20,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
})
