import { alpha, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"

export const EMPEROR_WIDTH = 80
export const EMPEROR_HEIGHT = 128

export const emperorClass = recipe({
  base: {
    flexShrink: 0,
    width: EMPEROR_WIDTH,
    height: EMPEROR_HEIGHT,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 4,
    paddingBlock: 12,
  },
  variants: {
    material: hueVariants((kolor) => ({
      border: `1px solid ${kolor(20)}`,
      boxShadow: `
        0px 0px 0px 4px inset ${kolor(70)},
        0px 0px 0px 2px ${alpha(kolor(30), 0.5)}
      `,
      background: `linear-gradient(
        60deg,
        ${kolor(80)} 0%,
        ${kolor(90)} 50%
      )`,
    })),
  },
})
