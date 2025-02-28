type Config<Type, Attr extends keyof Type> = {
  indexes: Readonly<Attr[]>
}

type Id = string
type Indexes<Type, Attr extends keyof Type> = Map<
  Attr,
  Map<Type[Attr], Set<Id>>
>
type ById<Type> = Record<Id, Type>

export class Database<Type, Attr extends keyof Type> {
  public byId: ById<Type>
  public indexes: Indexes<Type, Attr>

  constructor(config: Config<Type, Attr>) {
    this.byId = {} as ById<Type>
    this.indexes = new Map(config.indexes.map((i) => [i, new Map()]))
  }

  del(id: Id) {
    const entity = this.get(id)
    if (!entity) return

    delete this.byId[id]

    for (const indexName of this.indexes.keys()) {
      const index = this.indexes.get(indexName)!
      const value = entity[indexName]

      index.get(value)!.delete(id)
    }
  }

  set(id: Id, newEntity: Type) {
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
        index.set(newValue, new Set([id]))
      }
    }

    this.byId[id] = newEntity
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
>(config: Config<Type, Attr>, entities: ById<Type>) {
  const db = new Database<Type, Attr>(config)

  for (const entity of Object.values(entities)) {
    db.set(entity.id, entity)
  }

  return db
}
