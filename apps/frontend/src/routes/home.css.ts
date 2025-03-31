import { mediaQuery } from "@/styles/breakpoints"
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
  padding: 32,
  paddingTop: 0,
  gap: 32,
  height: "100vh",
  fontFamily: primary,
  backgroundImage: "url(/halftone.png)",
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 64,
      gap: 64,
      paddingTop: 0,
    },
  },
})

export const titleClass = style({
  ...fontSize.h1,
  color: color.crack50,
  textAlign: "center",
  "@media": {
    [mediaQuery({ p: "xs", l: "xxs" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.hero3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.hero2,
    },
  },
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
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    textAlign: "center",
    paddingInline: 8,
    paddingBlock: 4,
    borderRadius: 8,
    ...fontSize.l,
    "@media": {
      [mediaQuery({ p: "s", l: "xxs" })]: {
        ...fontSize.h3,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.h2,
        paddingInline: 16,
        paddingBlock: 12,
        borderRadius: 12,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        ...fontSize.h1,
      },
    },
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

export const buttonIconClass = style({
  width: 27,
  height: 39,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      width: 36,
      height: 52,
    },
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
