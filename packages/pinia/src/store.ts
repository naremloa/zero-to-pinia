import {
  ComputedRef,
  EffectScope,
  UnwrapRef,
  computed,
  effectScope,
  isReactive,
  isRef,
  markRaw,
  reactive,
  toRefs,
} from 'vue-demi'
import { Pinia, activePinia } from './rootStore'
import {
  DefineSetupStoreOptions,
  DefineStoreOptions,
  StateTree,
  Store,
  StoreDefinition,
  StoreGeneric,
  _DeepPartial,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  _GettersTree,
  _Method,
  _StoreWithState,
} from './types'

const { assign } = Object

function isComputed<T>(value: ComputedRef<T> | unknown): value is ComputedRef<T>
function isComputed(o: any): o is ComputedRef {
  return !!(isRef(o) && (o as any).effect)
}

function createOptionsStore<
  Id extends string,
  S extends StateTree,
  G extends _GettersTree<S>
>(
  id: Id,
  options: DefineStoreOptions<Id, S, G>,
  pinia: Pinia
): Store<Id, S, G> {
  const { state, getters } = options

  const initialState: StateTree | undefined = pinia.state.value[id]

  let store: Store<Id, S, G>

  function setup() {
    if (!initialState) {
      pinia.state.value[id] = state ? state() : {}
    }

    const localState = toRefs(pinia.state.value[id])

    return assign(
      localState,
      Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (__DEV__ && name in localState) {
          console.warn(
            `[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`
          )
        }

        computedGetters[name] = markRaw(
          computed(() => {
            const store = pinia._s.get(id)!
            // @ts-expect-error
            return getters![name].call(store, store)
          })
        )
        return computedGetters
      }, {} as Record<string, ComputedRef>)
    )
  }

  store = createSetupStore(id, setup, options, pinia, true)

  return store
}

function createSetupStore<
  Id extends string,
  SS extends Record<any, unknown>,
  S extends StateTree,
  G extends Record<string, _Method>
>(
  $id: Id,
  setup: () => SS,
  options:
    | DefineSetupStoreOptions<Id, S, G>
    | DefineStoreOptions<Id, S, G> = {},
  pinia: Pinia,
  isOptionsStore?: boolean
): Store<Id, S, G> {
  let scope!: EffectScope

  /**
   * 取出指定 $id 的 state
   * undefined 代表這是第一次註冊 store
   */
  const initialState = pinia.state.value[$id] as UnwrapRef<S> | undefined

  /**
   * 若是通過 OptionsStore 設定 state，已在 createOptionsStore 中處理過了。
   * 只有在第一次註冊 store 時，需要做初始化。
   */
  if (!isOptionsStore && !initialState) {
    pinia.state.value[$id] = {}
  }

  const partialStore = {
    $id,
  } as _StoreWithState<Id, S>
  const store: Store<Id, S, G> = reactive(partialStore) as unknown as Store<
    Id,
    S,
    G
  >

  pinia._s.set($id, store)

  // 獲取 setup store 的設定
  const setupStore = pinia._e.run(() => {
    // 執行 setup store 時，需要收集 effect
    scope = effectScope()
    return scope.run(setup)
  })!

  /**
   * 將當前 store 設定的且符合規定的內容，同步到全局的 store 中。
   * 目前處理的有 state
   */
  for (const key in setupStore) {
    const prop = setupStore[key]

    // 這邊是處理 state 的部分
    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      if (!isOptionsStore) {
        pinia.state.value[$id][key] = prop
      }
    }
  }

  // 將自定的 store 綁到輸出的 store 上
  assign(store, setupStore)

  // 將輸出的 store 的 $state 轉到全局 store 中
  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[$id],
  })

  // 檢查 state 的建立方式，只允許 plain object 的建立方式
  if (
    __DEV__ &&
    store.$state &&
    typeof store.$state === 'object' &&
    typeof store.$state.constructor === 'function' &&
    !store.$state.constructor.toString().includes('[native code]')
  ) {
    console.warn(
      `[🍍]: The "state" must be a plain object. It cannot be\n` +
        `\tstate: () => new MyClass()\n` +
        `Found in store "${store.$id}".`
    )
  }

  return store
}

export function defineStore<
  Id extends string,
  S extends StateTree = {},
  G extends _GettersTree<S> = {}
>(
  id: Id,
  options: Omit<DefineStoreOptions<Id, S, G>, 'id'>
): StoreDefinition<Id, S, G>
export function defineStore<
  Id extends string,
  S extends StateTree = {},
  G extends _GettersTree<S> = {}
>(options: DefineStoreOptions<Id, S, G>): StoreDefinition<Id, S, G>
export function defineStore<Id extends string, SS>(
  id: Id,
  storeSetup: () => SS,
  options?: DefineSetupStoreOptions<
    Id,
    _ExtractStateFromSetupStore<SS>,
    _ExtractGettersFromSetupStore<SS>
  >
): StoreDefinition<
  Id,
  _ExtractStateFromSetupStore<SS>,
  _ExtractGettersFromSetupStore<SS>
>
export function defineStore(
  idOrOptions: any,
  setup?: any,
  setupOptions?: any
): StoreDefinition {
  let id: string
  let options:
    | DefineStoreOptions<string, StateTree, _GettersTree<StateTree>>
    | DefineSetupStoreOptions<string, StateTree, _GettersTree<StateTree>>

  const isSetupStore = typeof setup === 'function'
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = isSetupStore ? setupOptions : setup
  } else {
    options = idOrOptions
    id = idOrOptions.id
  }

  function useStore(): StoreGeneric {
    if (__DEV__ && !activePinia) {
      throw new Error(
        `[🍍]: "getActivePinia()" was called but there was no active Pinia. Did you forget to install pinia?\n` +
          `\tconst pinia = createPinia()\n` +
          `\tapp.use(pinia)\n` +
          `This will fail in production.`
      )
    }

    const pinia = activePinia!

    if (!pinia._s.has(id)) {
      // 處理還未註冊過的 store
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia)
      } else {
        createOptionsStore(id, options as any, pinia)
      }
    }

    const store: StoreGeneric = pinia._s.get(id)!

    return store
  }
  useStore.$id = id
  return useStore
}
