import { App, Ref, effectScope, markRaw, ref } from 'vue-demi'
import { Pinia, setActivePinia } from './rootStore'
import { StateTree, StoreGeneric } from './types'

export function createPinia(): Pinia {
  const scope = effectScope(true)
  const state = scope.run<Ref<Record<string, StateTree>>>(() =>
    ref<Record<string, StateTree>>({})
  )!

  // pinia 實例無須轉為 reactive
  const pinia: Pinia = markRaw({
    install(app: App) {
      setActivePinia(pinia)
      pinia._a = app
    },
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: new Map<string, StoreGeneric>(),
    state,
  })
  return pinia
}
