import { color, hueVariants, alpha } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const homeClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 64,
  gap: 64,
  height: "100vh",
  marginTop: -64,
  fontFamily: primary,
  backgroundImage: "url(/halftone.png)",
})

export const titleClass = style({
  ...fontSize.hero2,
  color: color.crack50,
  textAlign: "center",
})

export const navClass = style({
  ...fontSize.h1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 3,
  gap: 16,
})

export const buttonClass = recipe({
  base: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    textAlign: "center",
    paddingInline: 24,
    paddingBlock: 16,
    borderRadius: 16,
  },
  variants: {
    hue: hueVariants((hue) => ({
      background: `linear-gradient(to bottom, ${alpha(hue(60), 0.1)}, ${alpha(hue(60), 0.2)})`,
      color: hue(40),
      ":hover": {
        background: `linear-gradient(to bottom, ${alpha(hue(60), 0.3)}, ${alpha(hue(60), 0.2)})`,
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
})
