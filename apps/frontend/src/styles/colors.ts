export const huesAndShades = {
  base: {
    "0": "oklch(99.85% 0.002 85)",
    "1000": "oklch(12% 0.003 85)",
  },

  tile: {
    90: "#FFF5D2",
    80: "#FFF3D6",
    70: "#FEE9C6",
    60: "#F9D9B6",
    50: "#E3C19F",
    40: "#B8987D",
    30: "#8C705B",
    20: "#5F493C",
    10: "#30231D",
  },

  bamboo: {
    90: "#CCE2CC",
    80: "#99C499",
    70: "#66A466",
    60: "#338333",
    50: "#006000",
    40: "#005700",
    30: "#004D00",
    20: "#004300",
    10: "#003700",
  },

  character: {
    90: "#F8D2CC",
    80: "#F0ADA3",
    70: "#E5887D",
    60: "#D96259",
    50: "#CB3D38",
    40: "#BA1918",
    30: "#900A10",
    20: "#61010B",
    10: "#2C0006",
  },

  circle: {
    90: "#CCD7E8",
    80: "#99AFCF",
    70: "#6687B5",
    60: "#335F98",
    50: "#00377A",
    40: "#00306F",
    30: "#002962",
    20: "#002255",
    10: "#001B46",
  },
} as const

export const accentHues = [
  // suits
  "bamboo",
  "character",
  "circle",
  // TODO: deprecate
  "tile",
] as const

export const noHue = "no-color"
export type NoHue = typeof noHue
export const accentHuesWithNoHue = [...accentHues, noHue] as const
export type AccentHuesWithNoHue = (typeof accentHuesWithNoHue)[number]

export type Hue = keyof typeof huesAndShades
export type AccentHue = (typeof accentHues)[number]
export type BaseHue = Exclude<Hue, AccentHue>
export type ShadeTypes<H extends Hue> = keyof (typeof huesAndShades)[H]

export type BaseColor = `${BaseHue}${ShadeTypes<BaseHue>}`
export type AccentColor = `${AccentHue}${ShadeTypes<AccentHue>}`
export type Color = BaseColor | AccentColor

const flatten: { [key: string]: string } = {}

for (const hue in huesAndShades) {
  for (const shade in huesAndShades[hue as Hue]) {
    const shades = huesAndShades[hue as Hue] as any
    flatten[`${hue}${shade}`] = shades[shade] as string
  }
}
export const color = flatten as Record<Color, string>

export function colorize(hue: AccentHue, shade: ShadeTypes<AccentHue>) {
  return `${hue}${shade}` as AccentColor
}

export function shadeColor(hue: AccentHue) {
  return colorize.bind(null, hue)
}

export function contrastColor(
  hue: AccentHue,
  shade: ShadeTypes<AccentHue>,
  condition: boolean,
) {
  const finalShade = condition ? String(1000 - Number(shade)) : shade

  return colorize(hue, finalShade as ShadeTypes<AccentHue>)
}

export function hueVariants<T>(map: (fn: HueShadeGetter, hue: AccentHue) => T) {
  return accentHues.reduce(
    (acc, hue) => {
      acc[hue] = map(getHueColor(hue), hue)
      return acc
    },
    {} as { [K in AccentHue]: T },
  )
}

export function mapHues<T>(map: (fn: HueShadeGetter, hue: AccentHue) => T[]) {
  return accentHues.flatMap((hue) => map(getHueColor(hue), hue))
}

export function alpha(colorName: string, alpha: number) {
  const r = Number.parseInt(colorName.slice(1, 3), 16)
  const g = Number.parseInt(colorName.slice(3, 5), 16)
  const b = Number.parseInt(colorName.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export type HueShadeGetter = (
  shade: ShadeTypes<AccentHue>,
  fallback?: string,
) => string
export type ColorGetter = (hue: AccentHuesWithNoHue) => HueShadeGetter

export function getHueColor(hue: AccentHuesWithNoHue): HueShadeGetter {
  if (hue === noHue) {
    return (_shade: ShadeTypes<AccentHue>, fallback?: string) => {
      if (!fallback) {
        throw new Error("Fallback is required for noHue")
      }

      return fallback
    }
  }

  return (shade: ShadeTypes<AccentHue>) => color[colorize(hue, shade)]
}
