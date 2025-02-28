import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"
import { color, alpha, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"

export const instructionsClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "2rem",
  maxWidth: "1200px",
  margin: "0 auto",
  gap: "2rem",
  color: color.tile10,
  fontFamily: primary,
})

export const headerClass = style({
  textAlign: "center",
  ...fontSize.hero3,
  color: color.character50,
  marginBottom: "1rem",
})

export const sectionClass = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  borderRadius: "8px",
  marginBottom: "5rem",
  maxWidth: "800px",
})

export const sectionTitleClass = style({
  ...fontSize.hero4,
  color: color.bamboo50,
  marginBottom: "1rem",
})

export const sectionSubtitleClass = style({
  ...fontSize.h2,
  color: color.tile20,
  marginBottom: "0.5rem",
})

export const paragraphClass = style({
  ...fontSize.readable,
  fontFamily: "system-ui",
  color: color.tile10,
  marginBottom: "1rem",
})

export const tilePointsClass = style({
  ...fontSize.s,
  color: color.bamboo50,
  fontWeight: "bold",
})

export const boxClass = recipe({
  base: {
    paddingInline: "2rem",
    paddingBlock: "1rem",
    borderRadius: "8px",
    margin: "0.5rem 0",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      backgroundColor: alpha(kolor(50), 0.2),
    })),
  },
})

export const iconTextClass = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
})

export const tileIconClass = style({
  display: "flex",
  flexShrink: 0,
  position: "relative",
})

export const tileTextClass = style({
  ...fontSize.readable,
  color: color.tile10,
  fontFamily: "system-ui",
})

export const highlightClass = recipe({
  base: {
    fontWeight: "bold",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(40),
    })),
  },
})

export const miniTileClass = recipe({
  base: {
    border: `1px solid ${color.tile40}`,
    borderRadius: "4px",
    padding: 2,
    background: `linear-gradient(45deg, ${color.tile80} 60%, ${color.tile70})`,
    display: "inline-block",
    verticalAlign: "middle",
    boxShadow: `0 0 4px -1px ${alpha(color.tile40, 0.5)}`,
    margin: 4,
  },
  variants: {
    kind: {
      tile: {
        background: `linear-gradient(45deg, ${color.tile80} 60%, ${color.tile70})`,
      },
      flower: {
        background: `linear-gradient(45deg, ${color.flower80} 60%, ${color.flower70})`,
      },
      season: {
        background: `linear-gradient(45deg, ${color.season80} 60%, ${color.season70})`,
      },
    },
    highlighted: {
      true: {
        ":before": {
          content: "",
          background: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  },
})

export const strengthBarClass = recipe({
  base: {
    height: 12,
    width: 200,
    borderRadius: 24,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  variants: {
    color: {
      b: {
        backgroundColor: alpha(color.bamboo60, 0.3),
      },
      c: {
        backgroundColor: alpha(color.character60, 0.3),
      },
      o: {
        backgroundColor: alpha(color.circle60, 0.3),
      },
    },
  },
})

export const strengthBarImageClass = recipe({
  base: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    zIndex: 2,
  },
  variants: {
    suit: {
      b: {
        background: color.bamboo90,
        border: `1px solid ${color.bamboo50}`,
      },
      c: {
        background: color.character90,
        border: `1px solid ${color.character50}`,
      },
      o: {
        background: color.circle90,
        border: `1px solid ${color.circle50}`,
      },
    },
  },
})

export const strengthValueClass = recipe({
  base: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    fontWeight: "bold",
    ...fontSize.h2,
    color: color.tile10,
    zIndex: 3,
  },
  variants: {
    suit: {
      b: { color: color.bamboo30 },
      c: { color: color.character30 },
      o: { color: color.circle30 },
    },
  },
})

export const strengthPlayerBarClass = recipe({
  base: {
    position: "absolute",
    height: "100%",
    borderRadius: "12px",
    transition: "width 0.3s ease-out",
  },
  variants: {
    suit: {
      b: {
        background: `linear-gradient(to bottom, ${color.bamboo80}, ${color.bamboo70})`,
        border: `1px solid ${color.bamboo50}`,
        boxShadow: `
          1px 1px 2px 0 inset ${color.bamboo90},
          -1px -1px 2px 0 inset ${color.bamboo60}
        `,
      },
      c: {
        background: `linear-gradient(to bottom, ${color.character80}, ${color.character70})`,
        border: `1px solid ${color.character50}`,
        boxShadow: `
          1px 1px 2px 0 inset ${color.character90},
          -1px -1px 2px 0 inset ${color.character60}
        `,
      },
      o: {
        background: `linear-gradient(to bottom, ${color.circle80}, ${color.circle70})`,
        border: `1px solid ${color.circle50}`,
        boxShadow: `
          1px 1px 2px 0 inset ${color.circle90},
          -1px -1px 2px 0 inset ${color.circle60}
        `,
      },
    },
  },
})

export const tileColumnClass = style({
  display: "flex",
  flexDirection: "column",
})
