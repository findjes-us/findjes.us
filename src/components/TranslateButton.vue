<template>
  <div class="flex items-center gap-1">
    <IconLanguage class="w-4 h-4 shrink-0" />
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
/* Keep the translate widget container on one line */
.translate-widget {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

/* Force the Google Translate gadget wrapper inline */
.translate-widget .goog-te-gadget {
  display: inline-flex !important;
  align-items: center;
  white-space: nowrap;
  font-size: 0 !important; /* hide the "Powered by Google Translate" text */
  line-height: 1;
}

/* Style the Google Translate language select */
.translate-widget .goog-te-combo {
  font-size: 0.875rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  padding: 0.125rem 0.25rem;
  background: white;
  color: #111827;
  cursor: pointer;
  min-width: 9rem;
  white-space: nowrap;
  display: inline-block;
}

/* Hide the Google branding span that can cause extra height */
.translate-widget .goog-te-gadget > span {
  display: none !important;
}

/* Force the SIMPLE layout inner container to display as a single row */
.translate-widget .goog-te-gadget-simple {
  display: inline-flex !important;
  align-items: center !important;
  flex-direction: row !important;
  white-space: nowrap;
}

/* Keep the language text and arrow span inline */
.translate-widget .goog-te-gadget-simple > span,
.translate-widget .goog-te-gadget-simple > span > span {
  display: inline !important;
  vertical-align: middle;
}

/* Keep the Google icon inline and vertically centred */
.translate-widget .goog-te-gadget-icon {
  display: inline-block !important;
  vertical-align: middle;
}
</style>
