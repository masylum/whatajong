import { color } from "@/styles/colors"
import { style, keyframes } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"

export const lobbyClass = style({
  fontFamily: primary,
  width: "100vw",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 64,
  gap: 128,
  background: color.circle20,
  color: color.circle90,
})

export const titleClass = style({
  ...fontSize.hero1,
  textAlign: "center",
  color: color.character60,
})

export const playersClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 32,
})

export const playerClass = style({
  ...fontSize.hero3,
  fontFamily: primary,
  display: "flex",
  alignItems: "center",
  gap: 32,
  padding: 16,
  borderRadius: 64,
})

export const vsClass = style({
  ...fontSize.hero2,
  textAlign: "center",
  color: color.circle80,
})

export const instructionClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  minWidth: 0,
})

export const instructionTitleClass = style({
  ...fontSize.hero4,
  maxWidth: 600,
  textAlign: "center",
  color: color.circle80,
})

export const urlClass = style({
  ...fontSize.l,
  color: color.circle80,
  fontFamily: "monospace",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minWidth: 0,
  userSelect: "all",
  padding: 16,
  borderRadius: 16,
  background: color.circle50,
  selectors: {
    "&::selection": {
      background: color.circle70,
      color: color.circle10,
    },
  },
})

export const buttonClass = style({
  background: "none",
  border: "none",
  color: color.circle90,
  cursor: "pointer",
})

export const copyIconClass = style({
  stroke: color.circle80,
  selectors: {
    [`${buttonClass}:hover &`]: {
      stroke: color.circle90,
    },
  },
})

const copySuccessAnimation = keyframes({
  "0%": {
    transform: "scale(0)",
    opacity: 0.8,
  },
  "70%": {
    transform: "scale(2)",
    opacity: 0.6,
  },
  "100%": {
    transform: "scale(2.5)",
    opacity: 0,
  },
})

export const copySuccessCircleClass = style({
  position: "absolute",
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  background: color.bamboo60,
  pointerEvents: "none",
  transform: "scale(0)",
  opacity: 0,
  animation: `${copySuccessAnimation} 1s ease-out forwards`,
  animationFillMode: "forwards",
  animationPlayState: "running",
})

export const copiedIconContainerClass = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
})

export const copiedIconClass = style({
  stroke: color.bamboo70,
  position: "relative",
  zIndex: 1,
  selectors: {
    [`${buttonClass}:hover &`]: {
      stroke: color.bamboo80,
    },
  },
})
