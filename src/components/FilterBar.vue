<template>
  <div class="flex flex-wrap gap-3 items-center">
    <div class="flex items-center gap-1">
      <IconBook class="w-4 h-4 text-indigo-500" />
      <select
        :value="book"
        class="border border-gray-300 rounded-md text-sm px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        @change="emit('update:book', $event.target.value); emit('update:chapter', ''); emit('update:verse', '')"
      >
        <option value="">All Books</option>
        <option v-for="b in books" :key="b" :value="b">{{ b }}</option>
      </select>
    </div>

    <div class="flex items-center gap-1">
      <IconBookmark class="w-4 h-4 text-indigo-500" />
      <select
        :value="chapter"
        :disabled="!book"
        class="border border-gray-300 rounded-md text-sm px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-40"
        @change="emit('update:chapter', $event.target.value); emit('update:verse', '')"
      >
        <option value="">All Chapters</option>
        <option v-for="c in chapters" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div class="flex items-center gap-1">
      <IconHash class="w-4 h-4 text-indigo-500" />
      <select
        :value="verse"
        :disabled="!chapter"
        class="border border-gray-300 rounded-md text-sm px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-40"
        @change="emit('update:verse', $event.target.value)"
      >
        <option value="">All Verses</option>
        <option v-for="v in verses" :key="v" :value="v">{{ v }}</option>
      </select>
    </div>

    <button
      v-if="book || chapter || verse"
      class="text-xs text-indigo-600 hover:underline flex items-center gap-1"
      @click="resetFilters"
    >
      <IconX class="w-3 h-3" />
      Clear filters
    </button>
  </div>
</template>

<script setup>
import { IconBook, IconBookmark, IconHash, IconX } from '@tabler/icons-vue'

defineProps({
  book: { type: String, default: '' },
  chapter: { type: String, default: '' },
  verse: { type: String, default: '' },
  books: { type: Array, default: () => [] },
  chapters: { type: Array, default: () => [] },
  verses: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:book', 'update:chapter', 'update:verse'])

function resetFilters() {
  emit('update:book', '')
  emit('update:chapter', '')
  emit('update:verse', '')
}
</script>
