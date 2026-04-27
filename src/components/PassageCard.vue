<template>
  <article class="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
    <header class="flex items-center gap-2 mb-2">
      <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
        {{ passage.book }}
      </span>
      <span class="text-xs text-gray-500">
        {{ passage.chapter }}:{{ passage.verse }}
      </span>
    </header>
    <p class="text-sm text-gray-800 leading-relaxed">{{ passage.text }}</p>
  </article>
</template>

<script setup>
defineProps({
  passage: {
    type: Object,
    required: true,
  },
})
</script>
