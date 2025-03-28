import { color } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { globalStyle } from "@vanilla-extract/css"

globalStyle("div#boarding-popover-item", {
  borderRadius: 12,
  maxWidth: 300,
  background: color.bone90,
})

globalStyle(".boarding-popover-tip", {
  display: "none",
})

globalStyle(".boarding-popover-title", {
  ...fontSize.h3,
  color: color.bone30,
  fontFamily: primary,
  marginBottom: 12,
})

globalStyle(".boarding-popover-description", {
  ...fontSize.l,
  color: color.bone20,
  fontFamily: secondary,
})
