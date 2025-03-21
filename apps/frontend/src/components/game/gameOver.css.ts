import { color } from "@/styles/colors"
import { style, createVar } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"
import { fontSize } from "@/styles/fontSize"
import { keyframes } from "@vanilla-extract/css"

export const startX = createVar()
export const endX = createVar()
export const rotation = createVar()
export const duration = createVar()

const bounce = keyframes({
  "0%": {
    transform: `translate(${startX}, 0vh) rotate(0deg)`,
    opacity: 0,
  },
  "50%": {
    opacity: 1,
  },
  "100%": {
    transform: `translate(${endX}, 100vh) rotate(${rotation})`,
    opacity: 1,
  },
})

export const bouncingCardClass = style({
  position: "absolute",
  animation: `${bounce} ${duration} linear infinite`,
  animationFillMode: "forwards",
  top: 0,
  left: 0,
  opacity: 0,
  willChange: "transform",
})

export const gameOverClass = style({
  fontFamily: primary,
})

export const screenClass = recipe({
  base: {
    width: "100vw",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 64,
    gap: 64,
  },
  variants: {
    win: {
      true: {
        background: `linear-gradient(to bottom, ${color.bam20}, ${color.bam10})`,
        color: color.bam90,
      },
      false: {
        background: `linear-gradient(to bottom, ${color.crack20}, ${color.crack10})`,
        color: color.crack90,
      },
    },
  },
})

export const titleClass = style({
  ...fontSize.hero2,
  textAlign: "center",
  selectors: {
    [`${screenClass.classNames.variants.win.true} &`]: {
      color: color.bam70,
    },
    [`${screenClass.classNames.variants.win.false} &`]: {
      color: color.crack70,
    },
  },
})

const numberClass = style({
  ...fontSize.hero3,
})

export const timeClass = style([
  numberClass,
  {
    selectors: {
      [`${screenClass.classNames.variants.win.true} &`]: {
        color: color.bam70,
      },
      [`${screenClass.classNames.variants.win.false} &`]: {
        color: color.crack70,
      },
    },
  },
])

export const pointsClass = style([
  numberClass,
  {
    selectors: {
      [`${screenClass.classNames.variants.win.true} &`]: {
        color: color.bam80,
      },
      [`${screenClass.classNames.variants.win.false} &`]: {
        color: color.crack80,
      },
    },
  },
])

export const playersContainerClass = style({
  display: "flex",
  gap: 128,
})
