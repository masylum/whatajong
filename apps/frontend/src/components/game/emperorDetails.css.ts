import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary, secondary } from "@/styles/fontFamily.css"

export const emperorContainerClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  fontFamily: primary,
  ...fontSize.h3,
})

export const emperorIconClass = style({
  width: 100,
  borderRadius: 12,
})

export const detailsDialogClass = style({
  display: "flex",
  gap: 24,
  color: color.bone10,
})

// TODO: DRY
export const detailInfoClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.1)}, ${alpha(color.crack50, 0.2)})`,
  color: color.crack10,
  fontFamily: secondary,
  ...fontSize.m,
})
