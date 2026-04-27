<template>
  <div class="relative w-full flex gap-2">
    <div class="flex flex-1 items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
      <IconSearch class="w-5 h-5 text-gray-400 flex-shrink-0" />
      <label
        for="passage-search"
        class="sr-only"
      >Search passages</label>
      <input
        id="passage-search"
        v-model="localQuery"
        type="text"
        placeholder="Search passages or a passage reference, e.g. Matthew 17-18:3"
        class="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
        @keyup.enter="submit"
      >
      <button
        v-if="localQuery"
        class="text-gray-400 hover:text-gray-600"
        aria-label="Clear search"
        @click="clear"
      >
        <IconX class="w-4 h-4" />
      </button>
    </div>
    <button
      class="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
      @click="submit"
    >
      <IconSearch class="w-4 h-4" />
      Search
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { IconSearch, IconX } from '@tabler/icons-vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'search'])

const localQuery = ref(props.modelValue)
// Sync external value changes (e.g. initial load from URL) into the input field.
watch(() => props.modelValue, (v) => { localQuery.value = v })

function submit() {
  emit('update:modelValue', localQuery.value)
  emit('search', localQuery.value)
}

function clear() {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('search', '')
}
</script>
