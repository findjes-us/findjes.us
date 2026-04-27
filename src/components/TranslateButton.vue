<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <button
      class="text-sm hover:underline flex items-center gap-1"
      :class="open ? 'font-semibold underline' : ''"
      :aria-expanded="open"
      aria-haspopup="true"
      @click.stop="toggle"
    >
      <IconLanguage class="w-4 h-4" />
      Translate
    </button>

    <div
      v-show="open"
      class="absolute right-0 mt-2 z-50 bg-white rounded shadow-lg p-3 min-w-max"
    >
      <div id="google_translate_element" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { IconLanguage } from '@tabler/icons-vue'

const open = ref(false)
const containerRef = ref(null)

function initGoogleTranslate() {
  new window.google.translate.TranslateElement(
    { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
    'google_translate_element'
  )
}

function toggle() {
  open.value = !open.value
}

function onClickOutside(event) {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  // Set the global callback invoked by the Google Translate script
  window.googleTranslateElementInit = initGoogleTranslate

  // If the script already finished loading before this component mounted, init now
  if (window.google?.translate?.TranslateElement) {
    initGoogleTranslate()
  }

  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>
