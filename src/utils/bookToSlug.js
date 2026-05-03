/**
 * Convert a book name to a URL path segment (lowercase, spaces → hyphens).
 * e.g. "Song of Solomon" → "song-of-solomon"
 *
 * @param {string} book
 * @returns {string}
 */
export function bookToSlug(book) {
  return book.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Find the canonical book name matching a URL slug, or null if not found.
 *
 * @param {string} slug
 * @param {string[]} bookList
 * @returns {string|null}
 */
export function slugToBook(slug, bookList) {
  return bookList.find((b) => bookToSlug(b) === slug) ?? null
}
