<template>
  <div class="relative w-full">
    <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
      <IconSearch class="w-5 h-5 text-gray-400 flex-shrink-0" />
      <input
        v-model="localQuery"
        type="text"
        placeholder="Search passages… (supports *, ?, #, [a-z], [!abc])"
        class="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
        @keyup.enter="emit('search', localQuery)"
        @input="emit('search', localQuery)"
      />
      <button
        v-if="localQuery"
        class="text-gray-400 hover:text-gray-600"
        aria-label="Clear search"
        @click="clear"
      >
        <IconX class="w-4 h-4" />
      </button>
    </div>
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
watch(() => props.modelValue, (v) => { localQuery.value = v })
watch(localQuery, (v) => emit('update:modelValue', v))

function clear() {
  localQuery.value = ''
  emit('search', '')
}
</script>
