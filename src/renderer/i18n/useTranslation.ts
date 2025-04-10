import { useGlobalState } from "@/state/globalState"
import * as i18n from "@solid-primitives/i18n"
import { createMemo } from "solid-js"
import { en } from "./en"
import { es } from "./es"

const DICTIONARIES = { en, es } as const
type Locale = keyof typeof DICTIONARIES
export type Translator = i18n.ChainedTranslator<i18n.Flatten<typeof en>>

export function useTranslation() {
  const global = useGlobalState()
  const flatDict = createMemo(() => {
    const locale = global.locale as Locale
    const dict = DICTIONARIES[locale] ?? DICTIONARIES.en
    return i18n.flatten(dict)
  })

  const t = i18n.translator(flatDict, i18n.resolveTemplate)
  return i18n.proxyTranslator(t)
}
