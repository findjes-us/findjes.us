<template>
  <div>
    <div
      v-if="passages.length === 0"
      class="text-center py-16 text-gray-500"
    >
      <IconMoodSad class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p class="text-lg font-medium">
        No matching passages found.
      </p>
      <p class="text-sm mt-1">
        Try adjusting your filters or
        <button
          class="text-jesuspurple-600 underline hover:text-jesuspurple-800"
          @click="emit('show-tips')"
        >
          tips for using wildcards
        </button>.
      </p>
    </div>
    <div v-else>
      <p class="text-xs text-gray-400 mb-4">
        {{ passages.length }} passage{{ passages.length !== 1 ? 's' : '' }} found
      </p>
      <div class="space-y-6">
        <section
          v-for="group in groupedPassages"
          :key="`${group.book}-${group.chapter}`"
        >
          <h2 class="font-bold text-base mb-1">
            {{ group.book }} {{ group.chapter }}
          </h2>
          <p class="text-sm text-gray-800 leading-relaxed">
            <template
              v-for="(v, i) in group.verses"
              :key="v.verse"
            >
              {{ i > 0 ? ' ' : '' }}<sup
                :id="anchorId(group.book, group.chapter, v.verse)"
                class="mr-0.5"
              >
                <a
                  :href="`#${anchorId(group.book, group.chapter, v.verse)}`"
                  class="text-jesuspurple-500 hover:text-jesuspurple-700"
                >{{ v.verse }}</a>
              </sup><span v-html="renderText(v.text)" />
            </template>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IconMoodSad } from '@tabler/icons-vue'
import { renderJesusText } from '../utils/renderJesusText.js'

const props = defineProps({
  passages: { type: Array, default: () => [] },
  redLetter: { type: Boolean, default: false },
})
const emit = defineEmits(['show-tips'])

function renderText(text) {
  return renderJesusText(text, props.redLetter)
}

function anchorId(book, chapter, verse) {
  return `${book.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${chapter}-${verse}`
}

const groupedPassages = computed(() => {
  const groups = []
  let current = null
  for (const p of props.passages) {
    if (!current || current.book !== p.book || current.chapter !== p.chapter) {
      current = { book: p.book, chapter: p.chapter, verses: [] }
      groups.push(current)
    }
    current.verses.push({ verse: p.verse, text: p.text })
  }
  return groups
})
</script>
