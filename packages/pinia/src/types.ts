import { ComputedRef, UnwrapRef } from 'vue-demi'

export type StateTree = Record<string | number | symbol, any>

export function isPlainObject<S extends StateTree>(
  value: S | unknown
): value is S
export function isPlainObject(o: any): o is StateTree {
  return (
    o &&
    typeof o === 'object' &&
    Object.prototype.toString.call(o) === '[object Object]' &&
    typeof o.toJSON !== 'function'
  )
}

// deep partial object
export type _DeepPartial<T> = { [K in keyof T]?: _DeepPartial<T[K]> }

// generic type for function
export type _Method = (...args: any[]) => any

// store 固有的底層屬性
export interface StoreProperties<Id extends string> {
  $id: Id
}

// store 主要功能實現的底層屬性
export interface _StoreWithState<Id extends string, S extends StateTree>
  extends StoreProperties<Id> {
  $state: UnwrapRef<S>
}

export type _StoreWithGetters<G> = {
  readonly [k in keyof G]: G[k] extends (...args: any[]) => infer R
    ? R // function
    : UnwrapRef<G[k]> // computed
}

// store 對外公開的屬性
export type Store<
  Id extends string = string,
  S extends StateTree = {},
  G = {}
> = _StoreWithState<Id, S> &
  // state
  UnwrapRef<S> &
  _StoreWithGetters<G>

export type StoreGeneric = Store<string, StateTree, _GettersTree<StateTree>>

export interface StoreDefinition<
  Id extends string = string,
  S extends StateTree = StateTree,
  G = _GettersTree<S>
> {
  (): Store<Id, S, G>
}

export type _GettersTree<S extends StateTree> = Record<
  string,
  (state: UnwrapRef<S>) => any
>

export interface DefineStoreOptionsBase<S extends StateTree, Store> {}

export interface DefineStoreOptions<Id extends string, S extends StateTree, G>
  extends DefineStoreOptionsBase<S, Store<Id, S, G>> {
  id: Id

  // state
  state?: () => S

  // getters
  getters?: G & ThisType<UnwrapRef<S> & _StoreWithGetters<G>> & _GettersTree<S>
}

// 從 setup option 中提取出 state 的 key
export type _ExtractStateFromSetupStore_Keys<SS> = keyof {
  [K in keyof SS as SS[K] extends _Method | ComputedRef ? never : K]: any
}

// 從 setup option 中提取出 getter 的 key
export type _ExtractGettersFromSetupStore_Keys<SS> = keyof {
  [K in keyof SS as SS[K] extends ComputedRef ? K : never]: any
}

export type _UnwrapAll<SS> = { [K in keyof SS]: UnwrapRef<SS[K]> }

//  從 setup option 中提取出 state
export type _ExtractStateFromSetupStore<SS> = SS extends undefined | void
  ? {}
  : _ExtractStateFromSetupStore_Keys<SS> extends keyof SS
  ? _UnwrapAll<Pick<SS, _ExtractStateFromSetupStore_Keys<SS>>>
  : never

// 從 setup option 中提取出 getters
export type _ExtractGettersFromSetupStore<SS> = SS extends undefined | void
  ? {}
  : _ExtractGettersFromSetupStore_Keys<SS> extends keyof SS
  ? Pick<SS, _ExtractGettersFromSetupStore_Keys<SS>>
  : never

export interface DefineSetupStoreOptions<
  Id extends string,
  S extends StateTree,
  G
> extends DefineStoreOptionsBase<S, Store<Id, S, G>> {}
