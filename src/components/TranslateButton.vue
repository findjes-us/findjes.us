<template>
  <div
    id="google_translate_element"
    class="translate-widget"
  />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let widgetObserver = null   // watches widget DOM / style mutations
let headObserver = null     // watches <head> for Google's CSS <link> injection
let rafId = null
let timers = []

/**
 * Apply inline !important styles directly on every element inside the widget.
 * Inline !important set via setProperty is the only mechanism that can beat
 * another inline !important (because it executes later in the same cascade
 * layer).  CSS rules — even with high specificity + !important — cannot
 * override inline styles Google sets with !important.
 */
function applyLayoutFix() {
  const el = document.getElementById('google_translate_element')
  if (!el) return

  // Fix the outer .goog-te-gadget wrapper (Google may set display:block inline)
  const gadget = el.querySelector('.goog-te-gadget')
  if (gadget) {
    gadget.style.setProperty('display', 'inline-flex', 'important')
    gadget.style.setProperty('align-items', 'center', 'important')
    gadget.style.setProperty('white-space', 'nowrap', 'important')
    gadget.style.setProperty('flex-wrap', 'nowrap', 'important')
  }

  const simple = el.querySelector('.goog-te-gadget-simple')
  if (!simple) return

  simple.style.setProperty('display', 'inline-flex', 'important')
  simple.style.setProperty('align-items', 'center', 'important')
  simple.style.setProperty('flex-direction', 'row', 'important')
  simple.style.setProperty('flex-wrap', 'nowrap', 'important')
  simple.style.setProperty('white-space', 'nowrap', 'important')

  // Fix every direct child: clear floats and force inline layout
  for (const child of simple.children) {
    child.style.setProperty('float', 'none', 'important')
    child.style.setProperty('vertical-align', 'middle', 'important')
    if (child.tagName === 'IMG') {
      // Images must be inline-block so they retain their dimensions
      child.style.setProperty('display', 'inline-block', 'important')
    } else {
      child.style.setProperty('display', 'inline', 'important')
      child.style.setProperty('white-space', 'nowrap', 'important')
    }
  }
}

/**
 * Debounce multiple rapid mutations into a single rAF pass.
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
  window.googleTranslateElementInit = initGoogleTranslate

  if (window.google?.translate?.TranslateElement) {
    initGoogleTranslate()
  }

  // Watch widget for DOM and inline-style mutations
  const el = document.getElementById('google_translate_element')
  if (el) {
    widgetObserver = new MutationObserver(scheduleLayoutFix)
    widgetObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    })
  }

  // Watch <head> so we re-apply the fix when Google's CSS <link> is injected.
  // Google's stylesheet is loaded asynchronously; a CSS recalc triggered by
  // a new <link> does not fire a style-attribute mutation on widget elements,
  // so the widget observer alone would miss it.
  headObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeName === 'LINK' || node.nodeName === 'STYLE') {
          scheduleLayoutFix()
        }
      }
    }
  })
  headObserver.observe(document.head, { childList: true })

  // Belt-and-suspenders: re-apply at several points after mount to catch any
  // async init / CSS load that the observers might race with.
  timers = [0, 150, 400, 900, 2000].map((ms) => setTimeout(applyLayoutFix, ms))
})

onUnmounted(() => {
  widgetObserver?.disconnect()
  headObserver?.disconnect()
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  timers.forEach(clearTimeout)
  timers = []
})
</script>

<style>
/* Keep the translate widget container on one line.
 * min-width/min-height reserve space before Google Translate loads so the
 * nav bar doesn't reflow and Google has enough horizontal room to render
 * the SIMPLE widget (G icon + "Select Language ▼") on a single row. */
.translate-widget {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  min-width: 160px;
  min-height: 30px;
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
