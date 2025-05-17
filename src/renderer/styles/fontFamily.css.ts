import { globalFontFace } from "@vanilla-extract/css"

export const primary = "Brave Gates"
export const secondary = "Nunito Variable"
export const primaryUrl = "./BraveGates.otf"

globalFontFace(primary, {
  src: `url(${primaryUrl})`,
})
