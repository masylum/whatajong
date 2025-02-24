export const huesAndShades = {
  base: {
    "0": "oklch(99.85% 0.002 85)",
    "1000": "oklch(12% 0.003 85)",
  },
  flower: {
    90: "#FFE699",
    80: "#FFE699",
    70: "#FFE360",
    60: "#FFE360",
    50: "#FFE033",
    40: "#E0BB44",
    30: "#D0AA33",
    20: "#C09922",
    10: "#BB8811",
  },

  season: {
    90: "#FFD9B3",
    80: "#FFCCAA",
    70: "#FFC988",
    60: "#FFAA99",
    50: "#FF9988",
    40: "#FF8866",
    30: "#EE7755",
    20: "#DD6633",
    10: "#CC5522",
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
    90: "#CCDACF",
    80: "#A3BBA8",
    70: "#7A9C80",
    60: "#527C59",
    50: "#2B5B31",
    40: "#053A0A",
    30: "#012D03",
    20: "#001E00",
    10: "#000E00",
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
    90: "#CDCEDC",
    80: "#A6A9C0",
    70: "#7F84A3",
    60: "#5A6185",
    50: "#343F66",
    40: "#101D47",
    30: "#091637",
    20: "#040F25",
    10: "#010710",
  },
  firstPlayer: {
    90: "#F1E3F3",
    80: "#E3C7E5",
    70: "#D5ADD7",
    60: "#C794C6",
    50: "#B67CB3",
    40: "#976696",
    30: "#765077",
    20: "#553A58",
    10: "#352438",
  },
  secondPlayer: {
    90: "#FDE8D2",
    80: "#F8D5A8",
    70: "#F0C481",
    60: "#E4B55D",
    50: "#D6A63C",
    40: "#B28430",
    30: "#8E6425",
    20: "#68461A",
    10: "#432A10",
  },
} as const

export const accentHues = [
  "tile",
  "bamboo",
  "character",
  "circle",
  "season",
  "flower",
  "firstPlayer",
  "secondPlayer",
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

export type Alpha = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 9.5 | 10

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

export function objectHueMap<T>(
  map: (fn: HueShadeGetter, hue: AccentHue) => T,
) {
  return accentHues.reduce<T>((acc, hue) => {
    const result = map(getHueColor(hue), hue)
    return Object.assign({}, acc, result)
  }, {} as T)
}

export function forEachHue(
  fn: (fn: HueShadeGetter, hue: AccentHuesWithNoHue) => void,
  noHue?: boolean,
) {
  const hues = noHue ? accentHuesWithNoHue : accentHues
  for (const hue of hues) {
    fn(getHueColor(hue), hue)
  }
}

export function alpha(colorName: string, alpha: Alpha) {
  const extractedColor = colorName.match(/\((.*?)\)/)![1]
  return `oklch(${extractedColor} / ${alpha / 10})`
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

export const colorsByOrder = [
  [
    color.firstPlayer10,
    color.firstPlayer20,
    color.firstPlayer30,
    color.firstPlayer40,
    color.firstPlayer50,
    color.firstPlayer60,
    color.firstPlayer70,
    color.firstPlayer80,
    color.firstPlayer90,
  ],
  [
    color.secondPlayer10,
    color.secondPlayer20,
    color.secondPlayer30,
    color.secondPlayer40,
    color.secondPlayer50,
    color.secondPlayer60,
    color.secondPlayer70,
    color.secondPlayer80,
    color.secondPlayer90,
  ],
] as const
