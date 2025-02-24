import { color } from "@/styles/colors"
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
    paddingInline: 24,
    paddingBlock: 16,
    borderRadius: 24,
    cursor: "pointer",
    textDecoration: "none",
    position: "relative",
    border: "none",
    transform: "translateY(-2px)",
    transition: "transform 100ms, box-shadow 100ms",
    boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)",

    ":hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 5px 0 0 rgba(0,0,0,0.2)",
    },

    ":active": {
      animationName: pressDown,
      animationDuration: "100ms",
      animationFillMode: "forwards",
    },
  },
  variants: {
    hue: {
      bamboo: {
        background: `linear-gradient(to bottom, ${color.bamboo80} 0%, ${color.bamboo70} 100%)`,
        color: color.bamboo20,
        border: `1px solid ${color.bamboo60}`,
        boxShadow: `
          0 4px 0 0 ${color.bamboo40},
          inset 0 2px 2px 0 ${color.bamboo90},
          inset 0 -2px 2px 0 ${color.bamboo60}
        `,

        ":hover": {
          background: `linear-gradient(to bottom, ${color.bamboo90} 0%, ${color.bamboo80} 100%)`,
          boxShadow: `
            0 5px 0 0 ${color.bamboo40},
            inset 0 2px 2px 0 ${color.bamboo90},
            inset 0 -2px 2px 0 ${color.bamboo60}
          `,
        },

        ":active": {
          boxShadow: `
            0 0 0 0 ${color.bamboo40},
            inset 0 2px 2px 0 ${color.bamboo90},
            inset 0 -2px 2px 0 ${color.bamboo60}
          `,
        },
      },
      character: {
        background: `linear-gradient(to bottom, ${color.character80} 0%, ${color.character70} 100%)`,
        color: color.character20,
        border: `1px solid ${color.character60}`,
        boxShadow: `
          0 4px 0 0 ${color.character40},
          inset 0 2px 2px 0 ${color.character90},
          inset 0 -2px 2px 0 ${color.character60}
        `,

        ":hover": {
          background: `linear-gradient(to bottom, ${color.character90} 0%, ${color.character80} 100%)`,
          boxShadow: `
            0 5px 0 0 ${color.character40},
            inset 0 2px 2px 0 white,
            inset 0 -2px 2px 0 ${color.character60}
          `,
        },

        ":active": {
          boxShadow: `
            0 0 0 0 ${color.character40},
            inset 0 2px 2px 0 ${color.character90},
            inset 0 -2px 2px 0 ${color.character60}
          `,
        },
      },
    },
  },
})
