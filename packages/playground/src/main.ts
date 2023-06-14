import { computed, createApp, markRaw, Ref } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
import {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
} from 'vue-router'

const pinia = createPinia()

declare module 'pinia' {
  export interface PiniaCustomProperties {
    set route(
      value: RouteLocationNormalizedLoaded | Ref<RouteLocationNormalizedLoaded>
    )
    get route(): RouteLocationNormalized
  }
}

const app = createApp(App)
  .use(pinia)
  .use(router)
  // used in counter setup for tests
  .provide('injected', 'global')

app.mount('#app')
