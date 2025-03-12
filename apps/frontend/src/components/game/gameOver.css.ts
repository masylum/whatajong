import { alpha, color } from "@/styles/colors"
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
        background: color.bamboo10,
        color: color.bamboo90,
      },
      false: {
        background: color.character10,
      },
    },
  },
})

export const pointsContainerClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingInline: 32,
    paddingBlock: 24,
    borderRadius: 32,
    gap: 40,
  },
  variants: {
    multiplayer: {
      true: {},
      false: {},
    },
    win: {
      true: {
        selectors: {
          [`${screenClass.classNames.variants.win.true} &`]: {
            background: `linear-gradient(to bottom, ${alpha(color.bamboo30, 0.6)}, ${alpha(color.bamboo30, 0)})`,
          },
          [`${screenClass.classNames.variants.win.false} &`]: {
            background: `linear-gradient(to bottom, ${alpha(color.character30, 0.6)}, ${alpha(color.character30, 0)})`,
          },
        },
      },
      false: {},
    },
  },
})

export const titleClass = style({
  ...fontSize.hero2,
  textAlign: "center",
  selectors: {
    [`${screenClass.classNames.variants.win.true} &`]: {
      color: color.bamboo90,
    },
    [`${screenClass.classNames.variants.win.false} &`]: {
      color: color.character90,
    },
  },
})

const numberClass = style({
  selectors: {
    [`${pointsContainerClass.classNames.variants.multiplayer.true} &`]: {
      ...fontSize.h1,
    },
    [`${pointsContainerClass.classNames.variants.multiplayer.false} &`]: {
      ...fontSize.hero3,
    },
  },
})

export const timeClass = style([
  numberClass,
  {
    selectors: {
      [`${screenClass.classNames.variants.win.true} &`]: {
        color: color.bamboo70,
      },
      [`${screenClass.classNames.variants.win.false} &`]: {
        color: color.character70,
      },
    },
  },
])

export const pointsClass = style([
  numberClass,
  {
    selectors: {
      [`${screenClass.classNames.variants.win.true} &`]: {
        color: color.bamboo80,
      },
      [`${screenClass.classNames.variants.win.false} &`]: {
        color: color.character80,
      },
    },
  },
])

export const playerTitleClass = style({
  display: "flex",
  alignItems: "center",
  fontFamily: primary,
  gap: 40,
})

export const playerNameClass = style({
  ...fontSize.hero3,
  selectors: {
    [`${screenClass.classNames.variants.win.true} &`]: {
      color: color.bamboo80,
    },
    [`${screenClass.classNames.variants.win.false} &`]: {
      color: color.character80,
    },
  },
})

export const playersContainerClass = style({
  display: "flex",
  gap: 128,
})

export const wreathClass = style({
  position: "absolute",
  top: 18,
  left: 10,
  mixBlendMode: "soft-light",
})
