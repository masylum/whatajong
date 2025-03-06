import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"

export const playersClass = style({
  position: "relative",
  zIndex: 1,
  display: "flex",
  width: "100%",
  gap: 50,
  justifyContent: "space-between",
  alignItems: "center",
  paddingBlock: "24px",
  paddingInline: "24px",
  fontFamily: primary,
})

export const playerClass = style({
  display: "flex",
  alignItems: "center",
  flexDirection: "row-reverse",
  gap: 32,
  position: "relative",
  ":first-child": {
    flexDirection: "row",
  },
})

export const playerIdClass = style({
  ...fontSize.h3,
  lineHeight: "1",
})
