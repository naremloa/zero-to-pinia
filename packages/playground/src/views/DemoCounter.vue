<template>
  <h2>Counter Store</h2>

  <p>Counter :{{ counter.count }}</p>

  <button @click="counter.count++">Increment</button>

  <hr />

  <CounterState></CounterState>
</template>

<script lang="ts" setup>
import CounterState from '../components/CounterState.vue'
import { useCounter } from '../stores/demo-counter'

const counter = useCounter()
</script>
