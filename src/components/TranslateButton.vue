<template>
  <div
    id="google_translate_element"
    class="translate-widget"
  />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let observer = null
let rafId = null

/**
 * Apply inline styles directly on the Google-injected elements so they
 * override any stylesheet rule (including Google's own !important rules that
 * are injected asynchronously and cannot be beaten by CSS alone).
 */
function applyLayoutFix() {
  const simple = document.querySelector('#google_translate_element .goog-te-gadget-simple')
  if (!simple) return

  simple.style.setProperty('display', 'inline-flex', 'important')
  simple.style.setProperty('align-items', 'center', 'important')
  simple.style.setProperty('flex-direction', 'row', 'important')
  simple.style.setProperty('white-space', 'nowrap', 'important')

  // Un-float the Google "G" logo image
  const icon = simple.querySelector('img')
  if (icon) {
    icon.style.setProperty('float', 'none', 'important')
    icon.style.setProperty('display', 'inline-block', 'important')
    icon.style.setProperty('vertical-align', 'middle', 'important')
  }

  // Keep the anchor (and its spans) inline so text doesn't wrap
  const anchor = simple.querySelector('a')
  if (anchor) {
    anchor.style.setProperty('display', 'inline', 'important')
    anchor.style.setProperty('white-space', 'nowrap', 'important')
    anchor.style.setProperty('vertical-align', 'middle', 'important')
  }
}

/**
 * Debounce layout fixes to one rAF frame so rapid Google Translate mutations
 * during widget initialisation are batched into a single DOM query + update.
 */
function scheduleLayoutFix() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    applyLayoutFix()
  })
}

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

  // Watch for Google Translate to inject / mutate its widget, then fix the layout.
  // Only observe childList/subtree (DOM changes) and 'style' attributes — no need
  // to track 'class' changes which would trigger unnecessary callbacks.
  const el = document.getElementById('google_translate_element')
  if (el) {
    observer = new MutationObserver(scheduleLayoutFix)
    observer.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
  }
})

onUnmounted(() => {
  observer?.disconnect()
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
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
