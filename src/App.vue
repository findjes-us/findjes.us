<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <!-- Header -->
    <header class="bg-indigo-700 text-white shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          class="flex items-center gap-2 text-xl font-bold hover:opacity-90"
          @click="currentPage = 'home'"
        >
          <IconCross class="w-6 h-6" />
          FindJes.us
        </button>
        <nav class="flex items-center gap-4">
          <button
            class="text-sm hover:underline flex items-center gap-1"
            :class="currentPage === 'home' ? 'font-semibold underline' : ''"
            @click="currentPage = 'home'"
          >
            <IconBook class="w-4 h-4" />
            Passages
          </button>
          <button
            class="text-sm hover:underline flex items-center gap-1"
            :class="currentPage === 'about' ? 'font-semibold underline' : ''"
            @click="currentPage = 'about'"
          >
            <IconInfoCircle class="w-4 h-4" />
            About
          </button>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-24 text-gray-500">
        <IconLoader class="w-8 h-8 animate-spin mr-3" />
        Loading passages…
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-24 text-red-600">
        <IconAlertCircle class="w-8 h-8 mx-auto mb-2" />
        <p>{{ error }}</p>
      </div>

      <!-- About page -->
      <AboutPage v-else-if="currentPage === 'about'" />

      <!-- Home page -->
      <template v-else>
        <div class="space-y-4">
          <SearchBar v-model="searchQuery" @search="searchQuery = $event" />
          <FilterBar
            v-model:book="filterBook"
            v-model:chapter="filterChapter"
            v-model:verse="filterVerse"
            :books="books"
            :chapters="chapters"
            :verses="verses"
          />
          <PassageList
            :passages="filteredPassages"
            @show-tips="showTips = true"
          />
        </div>
      </template>
    </main>

    <!-- Search Tips Modal -->
    <SearchTipsModal v-if="showTips" @close="showTips = false" />

    <!-- Footer -->
    <footer class="mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
      Scripture from the
      <a href="https://worldenglish.bible" target="_blank" rel="noopener" class="underline hover:text-gray-600">World English Bible</a>
      (Public Domain) ·
      <a href="https://github.com/findjes-us/findjes.us" target="_blank" rel="noopener" class="underline hover:text-gray-600">Open Source on GitHub</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IconCross, IconBook, IconInfoCircle, IconLoader, IconAlertCircle } from '@tabler/icons-vue'
import { usePassages } from './composables/usePassages.js'
import SearchBar from './components/SearchBar.vue'
import FilterBar from './components/FilterBar.vue'
import PassageList from './components/PassageList.vue'
import AboutPage from './components/AboutPage.vue'
import SearchTipsModal from './components/SearchTipsModal.vue'

const currentPage = ref('home')
const showTips = ref(false)
const loading = ref(true)
const error = ref(null)

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

onMounted(async () => {
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
</script>
