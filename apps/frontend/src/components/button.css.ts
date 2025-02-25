import { hueVariants } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { recipe } from "@vanilla-extract/recipes"
import { keyframes } from "@vanilla-extract/css"

const pressDown = keyframes({
  from: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)",
  },
  to: {
    transform: "translateY(0)",
    boxShadow: "0 0 0 0 rgba(0,0,0,0.2)",
  },
})

export const buttonClass = recipe({
  base: {
    ...fontSize.h1,
    paddingInline: 18,
    paddingBlock: 12,
    borderRadius: 8,
    cursor: "pointer",
    textDecoration: "none",
    position: "relative",
    border: "none",
    transform: "translateY(-2px)",
    transition: "transform 100ms, box-shadow 100ms",
    display: "flex",
    alignItems: "center",
    gap: 8,

    ":hover": {
      transform: "translateY(-3px)",
    },

    ":active": {
      animationName: pressDown,
      animationDuration: "100ms",
      animationFillMode: "forwards",
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(80)} 0%, ${kolor(
        70,
      )} 100%)`,
      color: kolor(20),
      border: `1px solid ${kolor(60)}`,
      boxShadow: `
          0px 6px 0 0 ${kolor(40)},
          inset 0 2px 2px 0 ${kolor(90)},
          inset 0 -2px 2px 0 ${kolor(60)}
        `,

      ":hover": {
        background: `linear-gradient(to bottom, ${kolor(90)} 0%, ${kolor(
          80,
        )} 100%)`,
        boxShadow: `
            0 5px 0 0 ${kolor(40)},
            inset 0 2px 2px 0 ${kolor(90)},
            inset 0 -2px 2px 0 ${kolor(60)}
          `,
      },

      ":active": {
        boxShadow: `
            0 0 0 0 ${kolor(40)},
            inset 0 2px 2px 0 ${kolor(90)},
            inset 0 -2px 2px 0 ${kolor(60)}
          `,
      },
    })),
  },
})
