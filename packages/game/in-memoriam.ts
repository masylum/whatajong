import { ReactiveMap as RMap } from "@solid-primitives/map"
import { ReactiveSet as RSet } from "@solid-primitives/set"
import {
  createStore,
  produce,
  reconcile,
  type SetStoreFunction,
} from "solid-js/store"
import { batch } from "solid-js"
import { intersection, difference } from "./lib/setMethods"

type Id = string
type Indexes<Type, Attr extends keyof Type> = Map<
  Attr,
  RMap<Type[Attr], RSet<Id>>
>
type ById<Type> = Record<Id, Type>
type DatabaseConfig<Type, Attr extends keyof Type> = {
  indexes: Readonly<Attr[]>
}

export class Value<Type extends Record<string, unknown>> {
  private setValue: SetStoreFunction<Type>

  constructor(private value: Type) {
    ;[this.value, this.setValue] = createStore(value)
  }

  set(value: Type) {
    this.setValue(value)
  }

  get() {
    return this.value
  }
}

export class Database<Type, Attr extends keyof Type> {
  public byId: ById<Type>
  public setById: SetStoreFunction<ById<Type>>
  public indexes: Indexes<Type, Attr>

  constructor(config: DatabaseConfig<Type, Attr>) {
    ;[this.byId, this.setById] = createStore({} as ById<Type>)
    this.indexes = new Map(config.indexes.map((i) => [i, new RMap()]))
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
        const value = entity[indexName]

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
        const newValue = newEntity[indexName]

        if (oldEntity) {
          const oldValue = oldEntity[indexName]

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

  filterBy<K extends Attr>(query: Record<K, Type[K]>): Type[] {
    let entities
    const values = Object.entries(query) as Array<[Attr, Type[Attr]]>

    for (const [attr, value] of values) {
      const entitySet = this.indexes.get(attr)!.get(value)
      if (!entitySet || entitySet.size === 0) return []

      entities = entities ? intersection(entities, entitySet) : entitySet
    }

    if (!entities) return []
    return [...entities].map((id) => this.get(id)!)
  }

  findBy<K extends Attr>(query: Record<K, Type[K]>): Type | null {
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

export function initDatabase<
  Type extends { id: string },
  Attr extends keyof Type,
>(config: DatabaseConfig<Type, Attr>, entities: ById<Type>) {
  const db = new Database<Type, Attr>(config)

  for (const entity of Object.values(entities)) {
    db.set(entity.id, entity)
  }

  return db
}
