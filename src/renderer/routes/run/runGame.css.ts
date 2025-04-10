import { EMPEROR_RATIO } from "@/components/emperor"
import { heightQueries, mediaQuery, widthQueries } from "@/styles/breakpoints"
import { alpha, color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { keyframes } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const FLIP_DURATION = 1000
const DELETED_DURATION = 300

const deletedKeyframes = keyframes({
  "0%": {
    transform: "scale(1, 1)",
    opacity: 1,
  },
  "20%": {
    transform: "scale(1.05, 0.9)",
    opacity: 0.9,
  },
  "50%": {
    transform: "scale(0.9, 1.05)",
    opacity: 0.5,
  },
  "100%": {
    transform: "scale(0.3, 1) translate(0, 10px)",
    opacity: 0,
  },
})

export const roundClass = style({
  display: "flex",
  flexDirection: "column",
  fontFamily: primary,
  borderRadius: 8,
  overflow: "hidden",
  border: `2px solid ${color.dot30}`,
  backgroundColor: color.dot30,
  boxShadow: `
    0px 0px 0px 1px ${color.dot30},
    0px 0px 0px 3px ${alpha(color.dot30, 0.1)},
    0px 0px 5px -3px ${color.dot10},
    0px 0px 10px -5px ${color.dot10}
  `,
  ...fontSize.s,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.m,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.h2,
    },
  },
})

export const roundTitleClass = style({
  color: color.dot90,
  textAlign: "center",
  paddingInline: 4,
  padding: 2,
})

export const roundObjectiveClass = style({
  color: color.dot30,
  background: color.dot90,
  textAlign: "center",
  paddingInline: 4,
  padding: 2,
  flex: 1,
})

export const menuContainerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      gap: 24,
    },
  },
})

export const emperorCardClass = recipe({
  base: {
    cursor: "pointer",
    width: 40 * EMPEROR_RATIO,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    border: `1px solid ${color.bone40}`,
    backgroundColor: color.bone90,
    padding: 0,
    outline: "none",
    ":hover": {
      filter: "brightness(1.1)",
    },
    ":focus": {
      outline: `2px solid ${color.bone30}`,
      outlineOffset: 2,
    },
  },
  variants: {
    orientation: {
      landscape: {
        "@media": {
          [widthQueries.xs]: {
            width: 50 * EMPEROR_RATIO,
            height: 50,
          },
          [widthQueries.s]: {
            width: 60 * EMPEROR_RATIO,
            height: 60,
          },
          [widthQueries.m]: {
            width: 70 * EMPEROR_RATIO,
            height: 70,
          },
          [widthQueries.l]: {
            width: 80 * EMPEROR_RATIO,
            height: 80,
          },
        },
      },
      portrait: {
        "@media": {
          [heightQueries.xs]: {
            height: 50,
            width: 50 * EMPEROR_RATIO,
          },
          [heightQueries.s]: {
            height: 60,
            width: 60 * EMPEROR_RATIO,
          },
          [heightQueries.m]: {
            height: 70,
            width: 70 * EMPEROR_RATIO,
          },
          [heightQueries.l]: {
            height: 80,
            width: 80 * EMPEROR_RATIO,
          },
        },
      },
    },
    deleted: {
      true: {
        animation: `${deletedKeyframes} ${DELETED_DURATION}ms ease-out forwards`,
        transformOrigin: "center",
      },
    },
  },
})

export const emperorDialogClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 32,
})

export const emperorDialogButtonsClass = style({
  display: "flex",
  fontFamily: primary,
  justifyContent: "flex-end",
  alignItems: "center",
  color: color.bone20,
  gap: 12,
})
