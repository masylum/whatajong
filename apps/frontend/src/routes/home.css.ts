import { color, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"
import { SIDE_SIZES } from "@/state/constants"

export const homeClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 64,
  gap: 64,
  height: "100vh",
  marginTop: -64,
  ":before": {
    backgroundImage: "url(/halftone.png)",
    content: "",
    position: "fixed",
    height: "100vh",
    width: "100vw",
    mixBlendMode: "overlay",
    top: 0,
    left: 0,
    zIndex: 1,
  },
})

export const titleClass = style({
  ...fontSize.hero2,
  color: color.character20,
  fontFamily: secondary,
  textAlign: "center",
})

export const navClass = style({
  ...fontSize.hero4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontFamily: primary,
  zIndex: 3,
  gap: 16,
})

export const buttonClass = recipe({
  base: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    gap: 8,
    textDecoration: "none",
    textAlign: "center",
    paddingInline: 24,
    paddingBlock: 12,
    borderRadius: 24,
  },
  variants: {
    hue: hueVariants((hue) => ({
      backgroundColor: `rgba(from ${hue(60)} r g b / 0.2)`,
      color: hue(30),
      ":hover": {
        backgroundColor: `rgba(from ${hue(60)} r g b / 0.4)`,
        color: hue(20),
      },
    })),
  },
})

export const frameClass = style({})

export const frameTopClass = style({
  display: "flex",
  position: "absolute",
  top: 0,
  left: 0,
})

export const frameBottomClass = style({
  display: "flex",
  position: "absolute",
  bottom: 0,
  left: 0,
})

export const frameLeftClass = style({
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: 0,
  left: 0,
})

export const frameRightClass = style({
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: 0,
  right: 0,
})

export const cardClass = style({
  position: "relative",
  marginInline: SIDE_SIZES.xSide * 2,
  marginBlock: -SIDE_SIZES.ySide * 2,
})
