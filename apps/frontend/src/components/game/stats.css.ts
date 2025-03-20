import { style } from "@vanilla-extract/css"
import { color, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { fontSize } from "@/styles/fontSize"

const statItem = style({
  display: "flex",
  flexDirection: "column",
  ...fontSize.h2,
  gap: 12,
})

export const pillClass = recipe({
  base: {
    ...fontSize.h2,
    textAlign: "center",
    borderRadius: 12,
    paddingInline: 12,
    paddingBlock: 4,
    color: "white",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(60)}, ${kolor(50)})`,
      boxShadow: `1px -1px 0px 0 inset ${kolor(60)},
        0px 0px 0px 1px ${kolor(40)},
        0px 0px 3px -1px ${kolor(10)},
        0px 0px 10px -5px ${kolor(10)}`,
    })),
  },
})

export const pointsContainerClass = style({
  display: "flex",
  gap: 32,
})

export const pointsClass = style([
  statItem,
  {
    color: color.bamboo20,
  },
])

export const penaltyClass = style([
  statItem,
  {
    color: color.character20,
  },
])

export const movesClass = style([
  statItem,
  {
    color: color.circle20,
  },
])

export const statLabel = style({
  letterSpacing: "0.05em",
})
