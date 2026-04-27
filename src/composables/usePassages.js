import { ref, computed } from 'vue'
import { matchesWildcard } from '../utils/wildcard.js'

export function usePassages(dataRef) {
  const searchQuery = ref('')
  const filterBook = ref('')
  const filterChapter = ref('')
  const filterVerse = ref('')

  const allPassages = computed(() => {
    const list = []
    const data = dataRef.value
    if (!data) return list
    for (const [book, bookData] of Object.entries(data)) {
      for (const chapterObj of bookData.chapters) {
        for (const passage of chapterObj.passages) {
          list.push({
            book,
            chapter: chapterObj.chapter,
            verse: passage.verse,
            text: passage.text,
          })
        }
      }
    }
    return list
  })

  const books = computed(() => {
    const data = dataRef.value
    if (!data) return []
    return Object.keys(data)
  })

  const chapters = computed(() => {
    const data = dataRef.value
    if (!filterBook.value || !data) return []
    const bookData = data[filterBook.value]
    if (!bookData) return []
    return bookData.chapters.map((c) => c.chapter)
  })

  const verses = computed(() => {
    const data = dataRef.value
    if (!filterBook.value || !filterChapter.value || !data) return []
    const bookData = data[filterBook.value]
    if (!bookData) return []
    const chapterObj = bookData.chapters.find(
      (c) => c.chapter === Number(filterChapter.value)
    )
    if (!chapterObj) return []
    return chapterObj.passages.map((p) => p.verse)
  })

  const filteredPassages = computed(() => {
    return allPassages.value.filter((p) => {
      if (filterBook.value && p.book !== filterBook.value) return false
      if (filterChapter.value && p.chapter !== Number(filterChapter.value)) return false
      if (filterVerse.value && p.verse !== Number(filterVerse.value)) return false
      if (searchQuery.value && !matchesWildcard(p.text, searchQuery.value)) return false
      return true
    })
  })

  return {
    searchQuery,
    filterBook,
    filterChapter,
    filterVerse,
    books,
    chapters,
    verses,
    filteredPassages,
    allPassages,
  }
}
