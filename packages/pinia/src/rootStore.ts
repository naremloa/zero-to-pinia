import { App, EffectScope, Ref } from 'vue-demi'
import { StateTree, StoreGeneric } from './types'

// 全局存儲 pinia 實例的位置
export let activePinia: Pinia | undefined

// 動態調整使用的 pinia 實例
export const setActivePinia: (pinia: Pinia) => Pinia = (pinia) =>
  (activePinia = pinia)

// Pinia 結構
export interface Pinia {
  install: (app: App) => any

  _a: App

  _e: EffectScope

  // 註冊 store 的位置, key 是識別不同 store 的 id
  _s: Map<string, StoreGeneric>

  state: Ref<Record<string, StateTree>>
}
