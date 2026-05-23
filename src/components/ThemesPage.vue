<template>
  <section class="max-w-6xl mx-auto py-4 sm:py-6 space-y-6">
    <h1 class="text-3xl font-bold text-jesuspurple-700 flex items-center gap-3">
      <IconStar class="w-8 h-8" />
      Top Themes
    </h1>

    <p class="text-base text-gray-700">
      Topics are sized by how often they appear in Jesus' quoted words and link to matching passages.
    </p>

    <div
      v-if="loading"
      class="py-10 text-gray-500"
    >
      Loading themes…
    </div>

    <div
      v-else-if="error"
      class="py-10 text-red-600"
    >
      {{ error }}
    </div>

    <div
      v-else
      class="flex flex-wrap gap-x-4 gap-y-3 items-baseline"
    >
      <a
        v-for="item in topics"
        :key="item.topic"
        :href="`/?q=${encodeURIComponent(item.topic)}`"
        class="text-jesuspurple-700 hover:underline"
        :style="{ fontSize: `${fontSizeRem(item.count)}rem`, lineHeight: 1.15 }"
        :title="`${item.topic} (${item.count})`"
        @click="onTopicClick($event, item.topic)"
      >
        {{ item.topic }}
      </a>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { IconStar } from '@tabler/icons-vue'

const props = defineProps({
  topics: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select-topic'])

const minCount = computed(() => {
  if (props.topics.length === 0) return 1
  return Math.min(...props.topics.map((t) => t.count))
})

const maxCount = computed(() => {
  if (props.topics.length === 0) return 1
  return Math.max(...props.topics.map((t) => t.count))
})

function fontSizeRem(count) {
  if (maxCount.value <= minCount.value) return 1
  const ratio = (count - minCount.value) / (maxCount.value - minCount.value)
  return 1 + (ratio * 7)
}

function onTopicClick(event, topic) {
  if (event.defaultPrevented) return
  if (event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  emit('select-topic', topic)
}
</script>
