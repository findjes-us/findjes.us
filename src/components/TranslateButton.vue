<template>
  <div
    id="google_translate_element"
    class="translate-widget"
  />
</template>

<script setup>
import { onMounted } from 'vue'

function initGoogleTranslate() {
  new window.google.translate.TranslateElement(
    { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL },
    'google_translate_element'
  )
}

onMounted(() => {
  window.googleTranslateElementInit = initGoogleTranslate

  if (window.google?.translate?.TranslateElement) {
    initGoogleTranslate()
  }
})
</script>

<style>
/* Reserve space in the nav bar before Google Translate loads */
.translate-widget {
  display: inline-flex;
  align-items: center;
  min-width: 9rem;
  min-height: 1.75rem;
}

/* Keep the gadget wrapper inline and hide "Powered by Google Translate" */
#google_translate_element .goog-te-gadget {
  display: inline-flex !important;
  align-items: center !important;
  font-size: 0 !important;
  line-height: 1 !important;
}

/* Hide the <br> and branding span Google injects after the <select> */
#google_translate_element .goog-te-gadget br,
#google_translate_element .goog-te-gadget > span {
  display: none !important;
}

/* Style the language <select> dropdown */
#google_translate_element .goog-te-combo {
  display: inline-block !important;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  padding: 0.125rem 0.25rem;
  background: white;
  color: #111827;
  cursor: pointer;
  min-width: 9rem;
  white-space: nowrap;
}
</style>
