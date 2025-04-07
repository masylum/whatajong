import * as i18n from "@solid-primitives/i18n"
import { en } from "./en"
import { es } from "./es"
import { createMemo } from "solid-js"
import { useGlobalState } from "@/state/globalState"

const DICTIONARIES = { en, es } as const
type Locale = keyof typeof DICTIONARIES

export function useTranslation() {
  const global = useGlobalState()
  const locale = global.locale
  const dict = DICTIONARIES[locale as Locale] ?? DICTIONARIES.en
  const flatDict = createMemo(() => i18n.flatten(dict))

  const t = i18n.translator(flatDict, i18n.resolveTemplate)
  return i18n.chainedTranslator(dict, t)
}
