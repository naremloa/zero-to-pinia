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

// store 對外公開的屬性
export type Store<
  Id extends string = string,
  S extends StateTree = {}
> = _StoreWithState<Id, S> &
  // state
  UnwrapRef<S>

export type StoreGeneric = Store<string, StateTree>

export interface StoreDefinition<
  Id extends string = string,
  S extends StateTree = StateTree
> {
  (): Store<Id, S>
}

export interface DefineStoreOptionsBase {}
export interface DefineStoreOptions<Id extends string, S extends StateTree>
  extends DefineStoreOptionsBase {
  id: Id
  state?: () => S
}

// 從 setup option 中提取出 state 的 key
export type _ExtractStateFromSetupStore_Keys<SS> = keyof {
  [K in keyof SS as SS[K] extends _Method | ComputedRef ? never : K]: any
}

export type _UnwrapAll<SS> = { [K in keyof SS]: UnwrapRef<SS[K]> }

//  從 setup option 中提取出 state
export type _ExtractStateFromSetupStore<SS> = SS extends undefined | void
  ? {}
  : _ExtractStateFromSetupStore_Keys<SS> extends keyof SS
  ? _UnwrapAll<Pick<SS, _ExtractStateFromSetupStore_Keys<SS>>>
  : never

export interface DefineSetupStoreOptions<Id extends string, S extends StateTree>
  extends DefineStoreOptionsBase {}
