<template>
  <div class="flex items-center gap-2">
    <IconLanguage class="w-4 h-4 shrink-0" />
    <span class="text-sm">Translate</span>
    <div
      id="google_translate_element"
      class="translate-widget"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { IconLanguage } from '@tabler/icons-vue'

function initGoogleTranslate() {
  new window.google.translate.TranslateElement(
    { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
    'google_translate_element'
  )
}

onMounted(() => {
  // Set the global callback invoked by the Google Translate script
  window.googleTranslateElementInit = initGoogleTranslate

  // If the script already finished loading before this component mounted, init now
  if (window.google?.translate?.TranslateElement) {
    initGoogleTranslate()
  }
})
</script>

<style>
/* Make the Google Translate select scrollable and vertically oriented */
.translate-widget .goog-te-combo {
  max-height: 40vh;
  overflow-y: auto;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  padding: 0.125rem 0.25rem;
  background: white;
  color: #111827;
  cursor: pointer;
}
</style>
