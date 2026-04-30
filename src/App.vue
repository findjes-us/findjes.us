<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <!-- Header -->
    <header class="bg-violet-300 text-black shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          class="flex items-center gap-2 text-xl font-bold hover:opacity-90"
          @click="navigateTo('home')"
        >
          <img src="../findjesus-favicon.svg" width="32" height="32" />
          FindJes.us
        </button>
        <nav class="flex flex-nowrap items-center gap-4">
          <button
            class="text-sm hover:underline flex items-center gap-1"
            :class="currentPage === 'home' ? 'font-semibold underline' : ''"
            @click="navigateTo('home')"
          >
            <IconBook class="w-4 h-4" />
            Passages
          </button>
          <button
            class="text-sm hover:underline flex items-center gap-1"
            :class="currentPage === 'about' ? 'font-semibold underline' : ''"
            @click="navigateTo('about')"
          >
            <IconInfoCircle class="w-4 h-4" />
            About
          </button>
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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { IconCross, IconBook, IconInfoCircle, IconLoader, IconAlertCircle } from '@tabler/icons-vue'
import { usePassages } from './composables/usePassages.js'
import SearchBar from './components/SearchBar.vue'
import FilterBar from './components/FilterBar.vue'
import PassageList from './components/PassageList.vue'
import AboutPage from './components/AboutPage.vue'
import SearchTipsModal from './components/SearchTipsModal.vue'
import TranslateButton from './components/TranslateButton.vue'

const currentPage = ref('home')
const showTips = ref(false)
const loading = ref(true)
const error = ref(null)
const redLetter = ref(false)

const rawData = ref({})

const {
  searchQuery,
  filterBook,
  filterChapter,
  filterVerse,
  books,
  chapters,
  verses,
  filteredPassages,
} = usePassages(rawData)

// ── URL sync ────────────────────────────────────────────────────────────────

// Guard to prevent update loops when syncing state from the URL.
let syncing = false

function updateURL() {
  if (syncing) return
  const params = new URLSearchParams()
  if (searchQuery.value) params.set('q', searchQuery.value)
  if (filterBook.value) params.set('book', filterBook.value)
  if (filterChapter.value) params.set('chapter', filterChapter.value)
  if (filterVerse.value) params.set('verse', filterVerse.value)
  if (currentPage.value === 'about') params.set('page', 'about')
  const qs = params.toString()
  window.history.pushState({}, '', qs ? `?${qs}` : window.location.pathname)
}

function syncStateFromURL() {
  syncing = true
  const params = new URLSearchParams(window.location.search)
  searchQuery.value = params.get('q') ?? ''
  filterBook.value = params.get('book') ?? ''
  filterChapter.value = params.get('chapter') ?? ''
  filterVerse.value = params.get('verse') ?? ''
  currentPage.value = params.get('page') === 'about' ? 'about' : 'home'
  // Allow watchers triggered by the above assignments to fire before we clear
  // the guard, so they don't call updateURL while we're loading from the URL.
  nextTick(() => { syncing = false })
}

// Sync filter-bar changes to URL immediately (they are instant UI selections).
watch([filterBook, filterChapter, filterVerse], updateURL)

// ── Handlers ────────────────────────────────────────────────────────────────

function onSearch(query) {
  searchQuery.value = query
  updateURL()
}

function navigateTo(page) {
  currentPage.value = page
  updateURL()
}

// ── Lifecycle ───────────────────────────────────────────────────────────────

function onPopState() {
  syncStateFromURL()
}

onMounted(async () => {
  window.addEventListener('popstate', onPopState)
  syncStateFromURL()

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
