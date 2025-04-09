import { style } from "@vanilla-extract/css"
import { color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary } from "@/styles/fontFamily.css"
import { mediaQuery } from "@/styles/breakpoints"

export const gameOverClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 32,
  "@media": {
    [mediaQuery({ p: "xl", l: "l" })]: {
      flexDirection: "row",
      gap: 64,
    },
  },
})

export const deckClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
})

export const deckRowsClass = style({
  display: "flex",
  alignItems: "flex-start",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  position: "relative",
  zIndex: 0,
})

export const deckItemClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
})

export const pairClass = style({
  position: "absolute",
  zIndex: -1,
})

export const ownedEmperorsClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
})

export const ownedEmperorsListClass = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
})

export const emperorClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  justifyContent: "center",
  padding: 0,
  maxWidth: 40,
  borderRadius: 12,
  overflow: "hidden",
})

export const gameOverInfoClass = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  gap: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 32,
    },
  },
})

export const moneyClass = style({
  alignSelf: "flex-start",
  fontFamily: primary,
  ...fontSize.m,
  background: `linear-gradient(to bottom, ${color.gold80}, ${color.gold70})`,
  boxShadow: `1px -1px 0px 0 inset ${color.gold90},
      0px 0px 0px 1px ${color.gold50},
      0px 0px 3px -1px ${color.gold30},
      0px 0px 10px -5px ${color.gold30}
    `,
  color: color.gold10,
  fontVariantLigatures: "none",
  display: "inline-block",
  borderRadius: 999,
  paddingInline: 8,
  paddingBlock: 2,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h3,
      paddingInline: 12,
      paddingBlock: 4,
    },
    [mediaQuery({ p: "s", l: "m" })]: {
      ...fontSize.h2,
      paddingInline: 16,
      paddingBlock: 4,
    },
  },
})
