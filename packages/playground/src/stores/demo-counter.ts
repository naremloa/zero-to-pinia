import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCounter = defineStore('demo-counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  return { count, double }
})
