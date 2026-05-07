/**
 * Parse a passage range string such as:
 *   "Matthew 17"          → startChapter=17, startVerse=1 (implied), no end
 *   "Matthew 17:5"        → startChapter=17, startVerse=5 (explicit), no end
 *   "Matthew 17-18"       → 17:1–18:last (all verses of ch 18)
 *   "Matthew 17-18:3"     → 17:1–18:3
 *   "Matthew 17:5-18:3"   → 17:5–18:3
 *   "Matthew 17:5-18"     → 17:5–17:18 (bare number after colon range = end verse in same chapter)
 *
 * Returns { book, startChapter, startVerse, startVerseExplicit, endChapter, endVerse }
 * or null if the string is not a recognizable passage reference.
 *
 * Rules (per spec):
 *  - If a chapter is provided without a verse, verse 1 is implied for the start.
 *  - If the start includes an explicit verse (chapter:verse) and the end is a bare
 *    number with no colon, the bare number is treated as an end verse within the
 *    same starting chapter (e.g. "Luke 7:1-15" → ch 7, v 1–15).
 *  - If the end is a chapter-only reference (no verse), all verses of that chapter
 *    are included (endVerse is set to a large sentinel value).
 *  - If the range is non-sequential (start > end position), callers should show
 *    all passages from the start position onwards within the book.
 *
 * @param {string} query
 * @param {string[]} knownBooks  Ordered list of book names from the data source.
 * @returns {{ book: string, startChapter: number, startVerse: number,
 *             startVerseExplicit: boolean, endChapter: number|null,
 *             endVerse: number|null } | null}
 */
export function parsePassageRange(query, knownBooks) {
  if (!query || !knownBooks || knownBooks.length === 0) return null

  const q = query.trim()

  // Try each known book name longest-first so that multi-word names like
  // "Song of Solomon" are matched before shorter prefixes like "Song".
  const sortedBooks = knownBooks.slice().sort((a, b) => b.length - a.length)

  for (const book of sortedBooks) {
    if (q.length <= book.length) continue
    if (q.slice(0, book.length).toLowerCase() !== book.toLowerCase()) continue

    const rest = q.slice(book.length)
    // The book name must be followed by whitespace.
    if (!/^\s/.test(rest)) continue

    const ref = rest.trim()
    // Match: chapter[:verse][-chapter[:verse]]
    const m = ref.match(/^(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/)
    if (!m) continue

    const startChapter = parseInt(m[1], 10)
    const startVerseExplicit = Boolean(m[2])
    const startVerse = startVerseExplicit ? parseInt(m[2], 10) : 1
    const endChapter = m[3] ? parseInt(m[3], 10) : null
    // Per spec: if endChapter is present but endVerse is absent, endVerse = 1 (implied).
    const endVerseExplicit = endChapter !== null ? Boolean(m[4]) : false
    const endVerse = endChapter !== null ? (m[4] ? parseInt(m[4], 10) : 1) : null

    let endChapter, endVerse
    if (!m[3]) {
      // No range – single chapter or single verse.
      endChapter = null
      endVerse = null
    } else if (startVerseExplicit && !m[4]) {
      // "chapter:verse-number": the bare number after the dash is an end verse
      // within the same starting chapter (e.g. "Luke 7:1-15" → ch 7, v 1–15).
      endChapter = startChapter
      endVerse = parseInt(m[3], 10)
    } else {
      // "chapter-chapter" or "chapter:verse-chapter:verse" or "chapter-chapter:verse"
      endChapter = parseInt(m[3], 10)
      // When no end verse is specified, use a large sentinel so that all verses
      // in the end chapter are included (e.g. "Luke 7-10" → all of ch 7–10).
      endVerse = m[4] ? parseInt(m[4], 10) : ALL_VERSES_IN_CHAPTER
    }

    return { book, startChapter, startVerse, startVerseExplicit, endChapter, endVerse, endVerseExplicit }
  }

  return null
}

// Multiplier used to combine chapter and verse into a single comparable integer.
// A value of 1000000 safely accommodates books with up to 999,999 verses per chapter.
const VERSE_OFFSET_MULTIPLIER = 1000000

// Sentinel used when no end verse is specified in a chapter-only range end
// (e.g. "Luke 7-10"). No Bible chapter has anywhere near this many verses
// (the maximum is Psalm 119 with 176 verses).
const ALL_VERSES_IN_CHAPTER = 999

/**
 * Test whether a flat passage object falls within a parsed passage range.
 *
 * @param {{ book: string, chapter: number, verse: number }} passage
 * @param {ReturnType<typeof parsePassageRange>} range
 * @returns {boolean}
 */
export function passageMatchesRange(passage, range) {
  if (passage.book !== range.book) return false

  const pPos = passage.chapter * VERSE_OFFSET_MULTIPLIER + passage.verse

  if (range.endChapter === null) {
    // No range – single chapter or single verse.
    if (range.startVerseExplicit) {
      return passage.chapter === range.startChapter && passage.verse === range.startVerse
    }
    return passage.chapter === range.startChapter
  }

  const startPos = range.startChapter * VERSE_OFFSET_MULTIPLIER + range.startVerse
  const endPos = range.endChapter * VERSE_OFFSET_MULTIPLIER + range.endVerse

  if (startPos > endPos) {
    // Non-sequential range: show all passages from start onwards within the book.
    return pPos >= startPos
  }

  return pPos >= startPos && pPos <= endPos
}
