//@flow
let nextID = 0
export type ID = string
export type TypeDef<+Type, +Group> = {
  +id: ID,
  +type: Type,
  +group: Group,
  +data: any,
}

export type GraphiteMeta = {
  +next: TypeDef<*, 'step'>,
  +seq: TypeDef<'seq', 'step'>,
}
export function pushNext(
  add: TypeDef<'multi' | 'seq' | 'single', 'step'>,
  seq: TypeDef<'seq' | 'multi', 'step'>,
) {
  seq.data.push(add)
}
const fabricHandler = create => (typeof create === 'function' ? create : _ => _)

declare export function typeDef<T: {+[key: string]: any}, Group>(
  group: Group,
  t: T,
): $ObjMapi<T, <K>(k: K) => (data: any) => TypeDef<K, Group>>
export function typeDef(group, t) {
  const result = {}
  let key
  for (key in t) {
    const currentKey = key
    const handler = fabricHandler(t[currentKey])
    result[currentKey] = args => ({
      id: (++nextID).toString(36),
      type: currentKey,
      group,
      data: handler(args),
    })
  }
  return result
}
