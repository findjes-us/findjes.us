<template>
  <div class="flex flex-wrap gap-3 items-center">
    <div class="flex items-center gap-1">
      <IconBook
        class="w-4 h-4 text-jesuspurple-500"
        aria-hidden="true"
      />
      <label
        for="filter-book"
        class="sr-only"
      >Book</label>
      <select
        id="filter-book"
        :value="book"
        class="border border-gray-300 rounded-md text-sm px-2 py-1.5 bg-white focus:ring-2 focus:ring-jesuspurple-500 outline-none"
        @change="emit('update:book', $event.target.value); emit('update:chapter', ''); emit('update:verse', '')"
      >
        <option value="">
          All Books
        </option>
        <option
          v-for="b in books"
          :key="b"
          :value="b"
        >
          {{ b }}
        </option>
      </select>
    </div>

    <div class="flex items-center gap-1">
      <IconBookmark
        class="w-4 h-4 text-jesuspurple-500"
        aria-hidden="true"
      />
      <label
        for="filter-chapter"
        class="sr-only"
      >Chapter</label>
      <select
        id="filter-chapter"
        :value="chapter"
        :disabled="!book"
        class="border border-gray-300 rounded-md text-sm px-2 py-1.5 bg-white focus:ring-2 focus:ring-jesuspurple-500 outline-none disabled:opacity-40"
        @change="emit('update:chapter', $event.target.value); emit('update:verse', '')"
      >
        <option value="">
          All Chapters
        </option>
        <option
          v-for="c in chapters"
          :key="c"
          :value="c"
        >
          {{ c }}
        </option>
      </select>
    </div>

    <div class="flex items-center gap-1">
      <IconHash
        class="w-4 h-4 text-jesuspurple-500"
        aria-hidden="true"
      />
      <label
        for="filter-verse"
        class="sr-only"
      >Verse</label>
      <select
        id="filter-verse"
        :value="verse"
        :disabled="!chapter"
        class="border border-gray-300 rounded-md text-sm px-2 py-1.5 bg-white focus:ring-2 focus:ring-jesuspurple-500 outline-none disabled:opacity-40"
        @change="emit('update:verse', $event.target.value)"
      >
        <option value="">
          All Verses
        </option>
        <option
          v-for="v in verses"
          :key="v"
          :value="v"
        >
          {{ v }}
        </option>
      </select>
    </div>

    <button
      v-if="book || chapter || verse"
      class="text-xs text-jesuspurple-600 hover:underline flex items-center gap-1"
      @click="resetFilters"
    >
      <IconX class="w-3 h-3" />
      Clear filters
    </button>

    <div class="flex items-center gap-2">
      <IconBible
        class="w-3.5 h-3.5 text-jesuspurple-500"
        aria-hidden="true"
      />
      <span
        id="red-letter-label"
        class="text-xs text-gray-600 cursor-default select-none"
      >Highlight Jesus' Words</span>
      <button
        type="button"
        role="switch"
        :aria-checked="redLetter"
        aria-labelledby="red-letter-label"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-jesuspurple-500 focus:ring-offset-2"
        :class="redLetter ? 'bg-jesuspurple-500' : 'bg-gray-200'"
        @click="emit('update:redLetter', !redLetter)"
      >
        <span
          class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="redLetter ? 'translate-x-5' : 'translate-x-0'"
        >
          <span
            class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
            :class="redLetter ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'"
            aria-hidden="true"
          >
            <IconX class="h-3 w-3 text-gray-400" />
          </span>
          <span
            class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
            :class="redLetter ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'"
            aria-hidden="true"
          >
            <IconCheck class="h-3 w-3 text-jesuspurple-500" />
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { IconBook, IconBookmark, IconHash, IconX, IconCheck, IconBible } from '@tabler/icons-vue'

defineProps({
  book: { type: String, default: '' },
  chapter: { type: String, default: '' },
  verse: { type: String, default: '' },
  books: { type: Array, default: () => [] },
  chapters: { type: Array, default: () => [] },
  verses: { type: Array, default: () => [] },
  redLetter: { type: Boolean, default: false },
})

const emit = defineEmits(['update:book', 'update:chapter', 'update:verse', 'update:redLetter'])

function resetFilters() {
  emit('update:book', '')
  emit('update:chapter', '')
  emit('update:verse', '')
}
</script>
