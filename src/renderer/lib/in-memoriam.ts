import { ReactiveMap as RMap } from "@solid-primitives/map"
import { ReactiveSet as RSet } from "@solid-primitives/set"
import { batch } from "solid-js"
import {
  type SetStoreFunction,
  createStore,
  produce,
  reconcile,
} from "solid-js/store"
import { difference, intersection } from "./setMethods"

type Id = string
type ById<Type> = Record<Id, Type>

export class Database<
  Type extends { id: Id },
  Config extends Record<string, (t: Type) => any>,
> {
  public byId: ById<Type>
  public setById: SetStoreFunction<ById<Type>>
  public indexes: Map<
    keyof Config,
    RMap<ReturnType<Config[keyof Attr]>, RSet<Id>>
  >
  public config: Config

  constructor(config: Config, values?: Type[]) {
    ;[this.byId, this.setById] = createStore({} as ById<Type>)
    this.config = config
    this.indexes = new Map(Object.keys(config).map((i) => [i, new RMap()]))

    if (values) {
      for (const value of values) {
        this.set(value.id, value)
      }
    }
  }

  update(values: ById<Type>) {
    batch(() => {
      const keysToDelete = difference(
        new Set(Object.keys(this.byId)),
        new Set(Object.keys(values)),
      )

      for (const id of keysToDelete) {
        this.del(id)
      }

      for (const id in values) {
        const entity = values[id]
        this.set(id, entity as any)
      }
    })
  }

  del(id: Id) {
    const entity = this.get(id)
    if (!entity) return

    batch(() => {
      this.setById(
        produce((byId) => {
          delete byId[id]
        }),
      )

      for (const indexName of this.indexes.keys()) {
        const index = this.indexes.get(indexName)!
        const value = this.config[indexName]!(entity)
        index.get(value)!.delete(id)
      }
    })
  }

  set(id: Id, newEntity: Type | null) {
    batch(() => {
      if (!newEntity) {
        this.del(id)
        return
      }
      const oldEntity = this.get(id)

      for (const indexName of this.indexes.keys()) {
        const index = this.indexes.get(indexName)!
        const newValue = this.config[indexName]!(newEntity)

        if (oldEntity) {
          const oldValue = this.config[indexName]!(oldEntity)

          if (oldValue !== newValue) {
            index.get(oldValue)!.delete(id)
          }
        }
        const entities = index.get(newValue)

        if (entities) {
          entities.add(id)
        } else {
          index.set(newValue, new RSet([id]))
        }
      }

      this.setById(id, reconcile(newEntity))
    })
  }

  filterBy(
    query: Partial<{ [Key in keyof Config]: ReturnType<Config[Key]> }>,
  ): Type[] {
    let entities
    const values = Object.entries(query)

    for (const [attr, value] of values) {
      const entitySet = this.indexes.get(attr)!.get(value!)
      if (!entitySet || entitySet.size === 0) return []

      entities = entities ? intersection(entities, entitySet) : entitySet
    }

    if (!entities) return []
    return [...entities].map((id) => this.get(id)!)
  }

  findBy(
    query: Partial<{ [Key in keyof Config]: ReturnType<Config[Key]> }>,
  ): Type | null {
    return this.filterBy(query)[0] || null
  }

  get all() {
    return Object.values(this.byId)
  }

  get(id: Id | null) {
    if (!id) return null
    return this.byId[id] || null
  }

  get size() {
    return Object.keys(this.byId).length
  }
}
