import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary, secondary } from "@/styles/fontFamily.css"

export const tooltipClass = style({
  position: "absolute",
  background: color.bone90,
  color: color.bone10,
  borderRadius: 12,
  border: `1px solid ${color.bone40}`,
  padding: 12,
  ...fontSize.l,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 10_000,
  pointerEvents: "none",
  transformOrigin: "center bottom",
  display: "flex",
  width: 400,
  gap: 24,
})

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
