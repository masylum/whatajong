import { alpha, color } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"

export const EMPEROR_WIDTH = 80
export const EMPEROR_HEIGHT = 120

export const emperorClass = recipe({
  base: {
    flexShrink: 0,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${color.bone20}`,
    boxShadow: `
        0px 0px 0px 4px inset ${color.bone70},
        0px 0px 0px 2px ${alpha(color.bone30, 0.5)}
      `,
    background: `linear-gradient(
        60deg,
        ${color.bone80} 0%,
        ${color.bone90} 50%
      )`,
  },
  variants: {
    frozen: {
      true: {
        filter: "hue-rotate(175deg) saturate(0.7) brightness(0.8)",
      },
    },
  },
})
