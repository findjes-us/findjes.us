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

/*
 * Use #google_translate_element (ID specificity: 1-0-0) in every selector so
 * our !important rules outrank Google's own !important rules, which are injected
 * asynchronously at class-level specificity (0-1-0) and would otherwise win the
 * cascade tie-breaker because they arrive later.
 */

/* Force the Google Translate gadget wrapper inline */
#google_translate_element .goog-te-gadget {
  display: inline-flex !important;
  align-items: center !important;
  white-space: nowrap !important;
  font-size: 0 !important; /* hide the "Powered by Google Translate" text */
  line-height: 1 !important;
}

/* Hide the Google branding span that can cause extra height */
#google_translate_element .goog-te-gadget > span {
  display: none !important;
}

/* Force the SIMPLE layout inner container to display as a single row */
#google_translate_element .goog-te-gadget-simple {
  display: inline-flex !important;
  align-items: center !important;
  flex-direction: row !important;
  white-space: nowrap !important;
}

/* Keep the Google icon inline, vertically centred, and un-floated */
#google_translate_element .goog-te-gadget-icon {
  display: inline-block !important;
  float: none !important;
  vertical-align: middle !important;
}

/* Keep the anchor and its child spans inline and on one line */
#google_translate_element .goog-te-gadget-simple > a,
#google_translate_element .goog-te-gadget-simple > a > span {
  display: inline !important;
  white-space: nowrap !important;
  vertical-align: middle !important;
}
</style>
