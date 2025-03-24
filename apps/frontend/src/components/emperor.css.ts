import { alpha, color } from "@/styles/colors"
import { style } from "@vanilla-extract/css"

export const EMPEROR_WIDTH = 100
export const EMPEROR_HEIGHT = 150

export const emperorClass = style({
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
})
