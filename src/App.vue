<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <!-- Header -->
    <header class="bg-violet-300 text-jesuspurple-500 shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a
          href="/"
          class="flex items-center gap-2 text-xl font-bold hover:opacity-90"
          @click.prevent="navigateTo('home')"
        >
          <img
            src="../findjesus-favicon.svg"
            width="32"
            height="32"
            alt="FindJes.us logo"
          >
          FindJes.us
        </a>
        <nav class="flex flex-nowrap items-center gap-4">
          <a
            href="/"
            class="text-sm hover:underline flex items-center gap-1"
            :class="currentPage === 'home' ? 'font-semibold underline' : ''"
            @click.prevent="navigateTo('home')"
          >
            <IconBook class="w-4 h-4" />
            Passages
          </a>
          <a
            href="/?page=about"
            class="text-sm hover:underline flex items-center gap-1"
            :class="currentPage === 'about' ? 'font-semibold underline' : ''"
            @click.prevent="navigateTo('about')"
          >
            <IconInfoCircle class="w-4 h-4" />
            About
          </a>
          <TranslateButton />
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- Loading state -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-24 text-gray-500"
      >
        <IconLoader class="w-8 h-8 animate-spin mr-3" />
        Loading passages…
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="text-center py-24 text-red-600"
      >
        <IconAlertCircle class="w-8 h-8 mx-auto mb-2" />
        <p>{{ error }}</p>
      </div>

      <!-- About page -->
      <AboutPage v-else-if="currentPage === 'about'" />

      <!-- Home page -->
      <template v-else>
        <div class="space-y-4">
          <div class="sticky top-0 z-10 bg-gray-50 space-y-4 py-2 -mx-4 px-4 shadow-sm">
            <SearchBar
              :model-value="searchQuery"
              @search="onSearch"
            />
            <FilterBar
              v-model:book="filterBook"
              v-model:chapter="filterChapter"
              v-model:verse="filterVerse"
              v-model:red-letter="redLetter"
              :books="books"
              :chapters="chapters"
              :verses="verses"
            />
            <p
              v-if="filteredPassages.length > 0"
              class="text-xs text-gray-400"
            >
              {{ filteredPassages.length }} passage{{ filteredPassages.length !== 1 ? 's' : '' }} found
            </p>
          </div>
          <PassageList
            :passages="filteredPassages"
            :red-letter="redLetter"
            @show-tips="showTips = true"
          />
        </div>
      </template>
    </main>

    <!-- Search Tips Modal -->
    <SearchTipsModal
      v-if="showTips"
      @close="showTips = false"
    />

    <!-- Footer -->
    <footer class="mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
      Scripture from the
      <a
        href="https://worldenglish.bible"
        target="_blank"
        rel="noopener"
        class="underline hover:text-gray-600"
      >World English Bible</a>
      (Public Domain) ·
      <a
        href="https://github.com/findjes-us/findjes.us"
        target="_blank"
        rel="noopener"
        class="underline hover:text-gray-600"
      >Open Source on GitHub</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted, nextTick } from 'vue'
import { IconBook, IconInfoCircle, IconLoader, IconAlertCircle } from '@tabler/icons-vue'
import { usePassages } from './composables/usePassages.js'
import SearchBar from './components/SearchBar.vue'
import FilterBar from './components/FilterBar.vue'
import PassageList from './components/PassageList.vue'
import AboutPage from './components/AboutPage.vue'
import SearchTipsModal from './components/SearchTipsModal.vue'
import TranslateButton from './components/TranslateButton.vue'

const currentPage = ref('home')
const showTips = ref(false)
const error = ref(null)
const redLetter = ref(false)

const rawData = ref({})

// On the server (SSG build) and on the client after hydration, the scripture
// data is provided via vite-ssg's initialState mechanism so no extra fetch is
// needed.  Fall back to null when running outside of the ViteSSG context (e.g.
// plain `vite dev`).
const initialWebData = inject('initialWebData', null)
const loading = ref(!initialWebData)
if (initialWebData) {
  rawData.value = initialWebData
}

const {
  searchQuery,
  filterBook,
  filterChapter,
  filterVerse,
  books,
  chapters,
  verses,
  filteredPassages,
  passageRange,
} = usePassages(rawData)

// ── URL helpers ─────────────────────────────────────────────────────────────

// Convert a book name to a URL path segment (lowercase, spaces → hyphens).
function bookToSlug(book) {
  return book.toLowerCase().replace(/\s+/g, '-')
}

// Find the canonical book name matching a URL slug, or null if not found.
function slugToBook(slug, bookList) {
  return bookList.find((b) => bookToSlug(b) === slug) ?? null
}

// ── URL sync ────────────────────────────────────────────────────────────────

// Guard to prevent update loops when syncing state from the URL.
let syncing = false

// Holds a pending { slug, chapter, verse } parsed from the URL path when
// books have not yet loaded (client-side fetch path).
let pendingBookSlug = null

function updateURL() {
  if (syncing) return

  // Use path-based URLs for book/chapter/verse filter navigation.
  if (filterBook.value && !searchQuery.value && currentPage.value !== 'about') {
    let path = '/' + bookToSlug(filterBook.value)
    if (filterChapter.value) {
      path += '/' + filterChapter.value
      if (filterVerse.value) {
        path += '/' + filterVerse.value
      }
    }
    window.history.pushState({}, '', path)
    return
  }

  const params = new URLSearchParams()
  if (searchQuery.value) params.set('q', searchQuery.value)
  if (currentPage.value === 'about') params.set('page', 'about')
  const qs = params.toString()
  window.history.pushState({}, '', qs ? `?${qs}` : '/')
}

function syncStateFromURL() {
  syncing = true
  const params = new URLSearchParams(window.location.search)
  const segments = window.location.pathname.split('/').filter(Boolean)

  // Path-based book/chapter/verse route: /{book}[/{chapter}[/{verse}]]
  // Only treat as a book path when there are no recognised query params.
  if (segments.length > 0 && !params.has('q') && !params.has('page')) {
    const bookSlug = segments[0]
    const matchedBook = slugToBook(bookSlug, books.value)
    if (matchedBook) {
      // Books are already loaded — resolve immediately.
      filterBook.value = matchedBook
      filterChapter.value = segments[1] ?? ''
      filterVerse.value = segments[2] ?? ''
      searchQuery.value = ''
      currentPage.value = 'home'
      nextTick(() => { syncing = false })
      return
    }
    // Books not yet loaded — stash the slug for deferred resolution.
    pendingBookSlug = { slug: bookSlug, chapter: segments[1] ?? '', verse: segments[2] ?? '' }
  }

  // Fall back to query-string state.
  searchQuery.value = params.get('q') ?? ''
  filterBook.value = ''
  filterChapter.value = ''
  filterVerse.value = ''
  currentPage.value = params.get('page') === 'about' ? 'about' : 'home'
  // Allow watchers triggered by the above assignments to fire before we clear
  // the guard, so they don't call updateURL while we're loading from the URL.
  nextTick(() => { syncing = false })
}

// Once the book list is populated (async data load), resolve any pending slug
// that was parsed from the URL before the data arrived.
const stopPendingSlugWatch = watch(books, (newBooks) => {
  if (newBooks.length > 0 && pendingBookSlug) {
    const matchedBook = slugToBook(pendingBookSlug.slug, newBooks)
    if (matchedBook) {
      syncing = true
      filterBook.value = matchedBook
      filterChapter.value = pendingBookSlug.chapter
      filterVerse.value = pendingBookSlug.verse
      nextTick(() => { syncing = false })
    }
    pendingBookSlug = null
    stopPendingSlugWatch()
  }
})

// Sync filter-bar changes to URL immediately (they are instant UI selections).
watch([filterBook, filterChapter, filterVerse], updateURL)

// ── Document title ──────────────────────────────────────────────────────────

const DEFAULT_TITLE = 'FindJes.us – Words and Works of Jesus'

const pageTitle = computed(() => {
  if (currentPage.value === 'about') return DEFAULT_TITLE

  // Passage-range search (e.g. "Mark 1:15-2:3 on FindJes.us")
  if (passageRange.value) {
    const r = passageRange.value
    let ref = `${r.book} ${r.startChapter}`
    if (r.startVerseExplicit) ref += `:${r.startVerse}`
    if (r.endChapter !== null) {
      ref += `-${r.endChapter}`
      if (r.startVerseExplicit) ref += `:${r.endVerse}`
    }
    return `${ref} on FindJes.us`
  }

  // Keyword / phrase search
  if (searchQuery.value) {
    return `Matches for '${searchQuery.value}' on FindJes.us`
  }

  // Book / chapter / verse filter
  if (filterBook.value) {
    let ref = filterBook.value
    if (filterChapter.value) {
      ref += ` ${filterChapter.value}`
      if (filterVerse.value) ref += `:${filterVerse.value}`
    }
    return `${ref} on FindJes.us`
  }

  return DEFAULT_TITLE
})

watch(pageTitle, (title) => {
  if (typeof document !== 'undefined') document.title = title
}, { immediate: true })

// ── Handlers ────────────────────────────────────────────────────────────────

function onSearch(query) {
  searchQuery.value = query
  updateURL()
}

function navigateTo(page) {
  currentPage.value = page
  if (page === 'home') {
    filterBook.value = ''
    filterChapter.value = ''
    filterVerse.value = ''
    searchQuery.value = ''
  }
  updateURL()
}

// ── Lifecycle ───────────────────────────────────────────────────────────────

function onPopState() {
  syncStateFromURL()
}

onMounted(async () => {
  window.addEventListener('popstate', onPopState)
  syncStateFromURL()

  // Skip fetch when the scripture data was already provided via SSR initialState.
  if (!loading.value) return

  try {
    const res = await fetch('/web.json')
    if (!res.ok) throw new Error(`Failed to load data: ${res.statusText}`)
    const json = await res.json()
    rawData.value = json
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState)
})
</script>
