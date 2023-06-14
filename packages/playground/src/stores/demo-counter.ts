import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounter = defineStore('demo-counter', () => {
  const count = ref(0)
  const consssst = 1
  return { count, consssst }
})
