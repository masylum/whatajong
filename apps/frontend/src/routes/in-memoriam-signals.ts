import { ReactiveMap as RMap } from "@solid-primitives/map"
import { ReactiveSet as RSet } from "@solid-primitives/set"
import { createStore, produce, type SetStoreFunction } from "solid-js/store"
import { batch } from "solid-js"

type Config<Type, Attr extends keyof Type> = {
  indexes: Readonly<Attr[]>
}

type Id = string
type Indexes<Type, Attr extends keyof Type> = Map<
  Attr,
  RMap<Type[Attr], RSet<Id>>
>
type ById<Type> = Record<Id, Type>

export class Database<Type, Attr extends keyof Type> {
  public byId: ById<Type>
  private setById: SetStoreFunction<ById<Type>>
  public indexes: Indexes<Type, Attr>

  constructor(config: Config<Type, Attr>) {
    ;[this.byId, this.setById] = createStore({} as ById<Type>)
    this.indexes = new Map(config.indexes.map((i) => [i, new RMap()]))
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

  set(id: Id, newEntity: Type) {
    batch(() => {
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

      this.setById(id, newEntity)
    })
  }

  filterBy<K extends Attr>(query: Record<K, Type[K]>): Type[] {
    let entities
    const values = Object.entries(query) as Array<[Attr, Type[Attr]]>

    for (const [attr, value] of values) {
      const entitySet = this.indexes.get(attr)!.get(value)
      if (!entitySet || entitySet.size === 0) return []

      entities = entities ? entitySet.intersection(entities) : entitySet
    }

    if (!entities) return []
    return [...entities].map((id) => this.get(id)!)
  }

  sortBy(attr: Attr, order: "asc" | "desc") {
    const index = this.indexes.get(attr)!
    return Array.from(index)
      .sort((a, b) => {
        let comp

        if (typeof a[0] === "string" && typeof b[0] === "string") {
          comp = a[0].localeCompare(b[0])
        } else if (typeof a[0] === "number" && typeof b[0] === "number") {
          comp = a[0] - b[0]
        } else if (a[0] instanceof Date && b[0] instanceof Date) {
          comp = a[0].getTime() - b[0].getTime()
        } else if (a[0] === null || a[0] === undefined) {
          comp = -1
        } else if (b[0] === null || b[0] === undefined) {
          comp = 1
        } else {
          comp = 0
        }

        return order === "asc" ? comp : -comp
      })
      .flatMap(([_, set]) => [...set].map((id) => this.get(id)).filter(Boolean))
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
