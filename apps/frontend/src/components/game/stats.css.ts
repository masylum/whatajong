import { style } from "@vanilla-extract/css"
import { alpha, color, hueVariants } from "@/styles/colors"
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
      background: `linear-gradient(to bottom, ${kolor(50)}, ${kolor(40)})`,
      boxShadow: `1px 1px 2px 0 inset ${kolor(60)},
        -1px -1px 2px 0px inset ${kolor(30)},
        0px 0px 0px 1px ${kolor(30)},
        0px 0px 0px 3px ${alpha(kolor(30), 0.1)},
        0px 0px 5px -3px ${kolor(10)},
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
    color: color.bam30,
  },
])

export const penaltyClass = style([
  statItem,
  {
    color: color.crack30,
  },
])

export const movesClass = style([
  statItem,
  {
    color: color.dot30,
  },
])

export const statLabel = style({
  letterSpacing: "0.05em",
})
