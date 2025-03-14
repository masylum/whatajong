import { color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"

export const emperorClass = style({
  ...fontSize.xs,
  fontFamily: primary,
  textAlign: "center",
  height: 100,
  width: 70,
  border: `1px solid ${color.tile30}`,
  boxShadow: `
    1px -1px 1px 0 inset ${color.tile50},
    -1px 1px 1px 0 inset ${color.tile80},
    0px 0px 5px -3px ${color.tile10},
    0px 0px 10px -5px ${color.tile10}
  `,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(to bottom, ${color.tile70}, ${color.tile60})`,
  color: color.tile10,
  padding: 4,
})
