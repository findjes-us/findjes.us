/**
 * Renders passage text, optionally bolding text wrapped in <span class="jesus">...</span> tags.
 *
 * When highlight is true, <span class="jesus"> sections also receive the "font-bold" class.
 * All other HTML characters in the text are escaped to prevent XSS.
 *
 * @param {string} text - Raw passage text, possibly containing <span class="jesus">…</span> tags
 * @param {boolean} highlight - Whether to render Jesus' words as bold
 * @returns {string} Safe HTML string ready for v-html binding
 */
export function renderJesusText(text, highlight) {
  const parts = text.split(/(<span class="jesus">|<\/span>)/)
  let inJesus = false
  let result = ''
  for (const part of parts) {
    if (part === '<span class="jesus">') {
      inJesus = true
      result += highlight ? '<span class="jesus font-bold text-jesuspurple-500">' : '<span class="jesus">'
    } else if (part === '</span>' && inJesus) {
      result += '</span>'
      inJesus = false
    } else {
      result += escapeHtml(part)
    }
  }
  return result
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
