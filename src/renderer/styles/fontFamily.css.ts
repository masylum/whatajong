import braveGates from "@/assets/BraveGates.otf"
import { globalFontFace } from "@vanilla-extract/css"

export const primary = "Brave Gates"
export const secondary = "Nunito Variable"

globalFontFace(primary, {
  src: `url(${braveGates})`,
})
