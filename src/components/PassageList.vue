<template>
  <div>
    <div v-if="passages.length === 0" class="text-center py-16 text-gray-500">
      <IconMoodSad class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p class="text-lg font-medium">No matching passages found.</p>
      <p class="text-sm mt-1">
        Try adjusting your filters or
        <button
          class="text-indigo-600 underline hover:text-indigo-800"
          @click="emit('show-tips')"
        >tips for using wildcards</button>.
      </p>
    </div>
    <div v-else>
      <p class="text-xs text-gray-400 mb-3">{{ passages.length }} passage{{ passages.length !== 1 ? 's' : '' }} found</p>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PassageCard v-for="(p, i) in visiblePassages" :key="i" :passage="p" />
      </div>
      <div v-if="passages.length > pageSize" class="mt-6 flex justify-center gap-2">
        <button
          class="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
          :disabled="page === 1"
          @click="page--"
        >
          <IconChevronLeft class="w-4 h-4 inline" /> Prev
        </button>
        <span class="px-3 py-2 text-sm text-gray-600">{{ page }} / {{ totalPages }}</span>
        <button
          class="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page++"
        >
          Next <IconChevronRight class="w-4 h-4 inline" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { IconMoodSad, IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import PassageCard from './PassageCard.vue'

const props = defineProps({
  passages: { type: Array, default: () => [] },
})
const emit = defineEmits(['show-tips'])

const pageSize = 30
const page = ref(1)

watch(() => props.passages, () => { page.value = 1 })

const totalPages = computed(() => Math.ceil(props.passages.length / pageSize))
const visiblePassages = computed(() => {
  const start = (page.value - 1) * pageSize
  return props.passages.slice(start, start + pageSize)
})
</script>
