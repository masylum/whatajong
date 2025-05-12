import {
  DELETED_DURATION,
  FALL_DURATION,
  FLOATING_NUMBER_DURATION,
  MOVE_DURATION,
  MUTATE_DURATION,
  SHAKE_DURATION,
  SHAKE_REPEAT,
} from "@/state/animationState"
import {
  ANIMATION_SLOW,
  easeBounce,
  overshot,
  tileFallingAnimation,
} from "@/styles/animations.css"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, keyframes, style } from "@vanilla-extract/css"
import { calc } from "@vanilla-extract/css-utils"
import { recipe } from "@vanilla-extract/recipes"

export const xVar = createVar()
export const yVar = createVar()
export const zVar = createVar()
export const realXVar = createVar()
export const realYVar = createVar()
export const realZVar = createVar()
export const widthVar = createVar()
export const heightVar = createVar()
export const sideSizeVar = createVar()

function zOffset(z: any = zVar) {
  return calc(z).multiply(-1).multiply(sideSizeVar)
}

function xCoord(x: any, z: any = zVar) {
  return calc(x).multiply(widthVar).divide(2).add(zOffset(z))
}

function yCoord(y: any, z: any = zVar) {
  return calc(y).multiply(heightVar).divide(2).add(zOffset(z))
}

function zIndex(x: any, y: any, z: any) {
  return `calc(${z} * 100 + ${x} * 2 + ${y} * 3)`
}

const shakeKeyframes = keyframes({
  "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
  "25%": { transform: "translate(-2px, 0) rotate(-1deg)" },
  "75%": { transform: "translate(2px, 0) rotate(1deg)" },
})

const windKeyframes = keyframes({
  "0%": {
    transform: `translate(${xCoord(xVar)}, ${yCoord(yVar)})`,
  },
  "100%": {
    transform: `translate(${xCoord(realXVar)}, ${yCoord(realYVar)})`,
  },
})

const zJump = 5
const jumpKeyframes = keyframes({
  "0%": {
    animationTimingFunction: "ease-in",
    zIndex: zIndex(xVar, yVar, zVar),
    opacity: 1,
  },
  "20%": {
    transform: `translate(${xCoord(xVar, zJump)}, ${yCoord(yVar, zJump)}) scale(1.1, 1.1)`,
    animationTimingFunction: "cubic-bezier(0.121, 0.264, 0.561, 0.857)",
    zIndex: zIndex(xVar, yVar, zJump),
  },
  "50%": {
    transform: `translate(
      ${xCoord(calc(realXVar).add(xVar).divide(2), zJump + 2)},
      ${yCoord(calc(realYVar).add(yVar).divide(2), zJump + 2)}
    ) scale(1.3, 1.3)`,
    opacity: 0.2,
    zIndex: zIndex(xVar, yVar, zJump + 2),
    animationTimingFunction: "cubic-bezier(0.121, 0.264, 0.561, 0.857)",
  },
  "80%": {
    transform: `translate(${xCoord(realXVar, zJump)}, ${yCoord(realYVar, zJump)}) scale(1.1, 1.1)`,
    animationTimingFunction: easeBounce,
    zIndex: zIndex(realXVar, realYVar, zJump),
  },
  "100%": {
    transform: `translate(${xCoord(realXVar, realZVar)}, ${yCoord(realYVar, realZVar)}) scale(1, 1)`,
    zIndex: zIndex(realXVar, realYVar, realZVar),
    opacity: 1,
  },
})

const mutateKeyframes = keyframes({
  "0%": {
    transform: "scale(1, 1)",
  },
  "20%": {
    transform: "scale(1.05, 0.9)",
  },
  "50%": {
    transform: "scale(0.9, 1.05)",
  },
  "100%": {
    transform: "scale(1, 1)",
  },
})

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
    transform: "scale(0.3, 1) translate(0, -10px)",
    opacity: 0,
  },
})

const floatingNumberKeyframes = keyframes({
  "0%": {
    transform: `translate(
      ${xCoord(xVar).add(calc(widthVar).divide(2)).subtract("50%")},
      ${yCoord(yVar).add(calc(heightVar).divide(2)).subtract("50%")}
    )`,
    opacity: 1,
  },
  "50%": {
    opacity: 0.8,
  },
  "100%": {
    transform: `translate(
      ${xCoord(xVar).add(calc(widthVar).divide(2)).subtract("50%")},
      ${yCoord(yVar).add(calc(heightVar).divide(2)).subtract(`${100}px`).subtract("50%")}
    )`,
    opacity: 0,
  },
})

const pulseVar = createVar()
const pulseKeyframes = keyframes({
  "0%, 100%": {
    transform: "scale(0.8, 0.8)",
  },
  "50%": {
    transform: "scale(1.3, 1.3)",
  },
})

export const scoreClass = style({
  position: "absolute",
  top: 0,
  left: 0,
  animation: `${floatingNumberKeyframes} ${FLOATING_NUMBER_DURATION}ms ${overshot} forwards`,
  ...fontSize.h3,
  lineHeight: 1,
  fontWeight: "bold",
  userSelect: "none",
  fontFamily: primary,
  transformOrigin: "50% 50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 9999,
  gap: 8,
})

export const scoreCoinsClass = style({
  borderRadius: 24,
  padding: "4px 8px",
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.9)}, ${alpha(color.crack40, 0.9)})`,
  boxShadow: `
    1px -1px 1px 0 inset ${color.crack60},
    0px 0px 0px 1px ${color.crack30},
    0px 0px 3px -1px ${color.crack10},
    0px 0px 10px -5px ${color.crack10}
  `,
  color: color.crack90,
})

export const pulseClass = recipe({
  base: {
    borderRadius: 4,
    position: "absolute",
    animation: `${pulseKeyframes} 3000ms ease-in-out infinite`,
    background: `radial-gradient(
      ellipse,
      rgba(from ${pulseVar} r g b / 0.3),
      rgba(from ${pulseVar} r g b / 0) 90%
    )`,
    pointerEvents: "none",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      vars: {
        [pulseVar]: kolor(50),
      },
    })),
  },
})

export const scorePointsClass = style({
  borderRadius: 8,
  padding: "4px 8px",
  background: `linear-gradient(to bottom, ${color.bam50}, ${color.bam40})`,
  boxShadow: `
    1px -1px 0px 0 inset ${color.bam50},
    0px 0px 0px 1px ${color.bam30},
    0px 0px 3px -1px ${color.bam10},
    0px 0px 10px -5px ${color.bam10}
  `,
  color: "white",
  pointerEvents: "none",
})

export const positionerClass = recipe({
  base: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "visible",
    transform: `translate(${xCoord(xVar)}, ${yCoord(yVar)})`,
    zIndex: zIndex(realXVar, realYVar, realZVar),
    width: `calc(${widthVar} + ${sideSizeVar})`,
    height: `calc(${heightVar} + ${sideSizeVar})`,
    pointerEvents: "none",
  },
  variants: {
    animation: {
      wind: {
        animation: `${windKeyframes} ${MOVE_DURATION}ms ${easeBounce} forwards`,
      },
      jump: {
        animation: `${jumpKeyframes} ${MOVE_DURATION}ms ease-in-out forwards`,
      },
      shake: {},
      deleted: {},
      fall: {},
      mutate: {},
    },
  },
})

export const tileClass = recipe({
  base: {
    pointerEvents: "none",
    outline: "none",
    transformOrigin: "50% 50%",
    WebkitTapHighlightColor: "transparent",
    width: "100%",
    height: "100%",
  },
  variants: {
    animation: {
      joker: {
        animationName: tileFallingAnimation,
        animationTimingFunction: easeBounce,
        animationDuration: ANIMATION_SLOW,
        animationDirection: "reverse",
        animationDelay: `calc(${zVar} * 30ms + (${xVar} + ${yVar}) * 5ms)`,
        animationFillMode: "forwards",
      },
      fall: {
        animationName: tileFallingAnimation,
        animationTimingFunction: easeBounce,
        animationDuration: `${FALL_DURATION}ms`,
        animationDelay: `calc(${zVar} * 20ms + (${xVar} + ${yVar}) * 4ms)`,
        animationFillMode: "backwards",
      },
      shake: {
        animation: `${shakeKeyframes} ${SHAKE_DURATION}ms ease-in-out ${SHAKE_REPEAT}`,
      },
      mutate: {
        animation: `${mutateKeyframes} ${MUTATE_DURATION}ms ease-in-out forwards`,
      },
      deleted: {
        animation: `${deletedKeyframes} ${DELETED_DURATION}ms ease-out forwards`,
      },
      wind: {},
      jump: {},
    },
  },
})

export const tileSvgClass = style({
  overflow: "visible",
})

export const clickableClass = recipe({
  base: {
    pointerEvents: "none",
  },
  variants: {
    canBeSelected: {
      true: { cursor: "pointer", pointerEvents: "auto" },
    },
  },
})
