import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  define: {
    __DEV__: 'true',
  },
  resolve: {
    dedupe: ['vue-demi', 'vue', 'pinia'],
    alias: {
      pinia: path.resolve(__dirname, '../pinia/src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi', '@vueuse/shared', '@vueuse/core', 'pinia'],
  },
})
