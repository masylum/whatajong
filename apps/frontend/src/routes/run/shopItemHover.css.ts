import { style, styleVariants, createVar } from "@vanilla-extract/css"
import { color } from "@/styles/colors"

const tooltipBgColor = createVar()
const tooltipTextColor = createVar()

export const tooltipClass = style({
  position: "absolute",
  background: tooltipBgColor,
  color: tooltipTextColor,
  borderRadius: "4px",
  padding: "8px 12px",
  fontSize: "14px",
  maxWidth: "250px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 1000,
  pointerEvents: "none",
  transition: "transform 0.05s ease-out",
  vars: {
    [tooltipBgColor]: color.bone10,
    [tooltipTextColor]: color.bone90,
  },
})

export const infoRowClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 0",
})

export const labelClass = style({
  fontWeight: "500",
})

export const valueClass = style({
  fontWeight: "600",
})

export const dividerClass = style({
  height: "1px",
  background: color.bone30,
  margin: "4px 0",
})

export const totalRowClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 0",
  marginTop: "4px",
  fontWeight: "700",
})

export const materialClass = styleVariants({
  glass: { color: color.glass50 },
  jade: { color: color.jade50 },
  bone: { color: color.bone50 },
  bronze: { color: color.bronze50 },
  gold: { color: color.gold50 },
})

export const titleClass = style({
  fontSize: "16px",
  fontWeight: "700",
  marginBottom: "8px",
  textAlign: "center",
})
