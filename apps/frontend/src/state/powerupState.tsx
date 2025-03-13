import { createContext, useContext, type ParentProps } from "solid-js"
import {
  type PowerupDb,
  type Powerup,
  type PowerupIndexes,
  powerupIndexes,
} from "@/lib/game"
import { Database } from "@/lib/in-memoriam"
import { persistentDatabase } from "./persistentDatabase"

const PowerupStateContext = createContext<PowerupDb | undefined>()

export function PowerupStateProvider(
  props: { powerupDb: PowerupDb } & ParentProps,
) {
  return (
    <PowerupStateContext.Provider value={props.powerupDb}>
      {props.children}
    </PowerupStateContext.Provider>
  )
}

export function usePowerupState() {
  const context = useContext(PowerupStateContext)
  if (!context) throw new Error("can't find PowerupStateContext")

  return context
}

export function createPowerupState({ id }: { id: () => string }) {
  return persistentDatabase({
    namespace: "powerup-state",
    id,
    db: () =>
      new Database<Powerup, PowerupIndexes>({ indexes: powerupIndexes }),
    init: (db) => {
      db.update({})
    },
  })
}
