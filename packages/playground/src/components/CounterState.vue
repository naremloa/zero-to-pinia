<script lang="ts" setup>
import { useCounter } from '../stores/demo-counter'

defineOptions({
  name: 'CounterState',
})

const counter = useCounter()
</script>
<template>
  <div>
    <p><code>counter.$state</code>:</p>
    <pre>{{ counter.$state }}</pre>
  </div>
</template>
