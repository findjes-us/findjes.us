/**
 * Renders passage text, optionally highlighting text wrapped in <jesus>...</jesus> tags.
 *
 * When highlight is true, <jesus>...</jesus> sections are wrapped in a span with class "jesus".
 * All other HTML characters in the text are escaped to prevent XSS.
 *
 * @param {string} text - Raw passage text, possibly containing <jesus>…</jesus> tags
 * @param {boolean} highlight - Whether to render Jesus' words as bold
 * @returns {string} Safe HTML string ready for v-html binding
 */
export function renderJesusText(text, highlight) {
  const parts = text.split(/(<jesus>|<\/jesus>)/i)
  let inJesus = false
  let result = ''
  for (const part of parts) {
    if (part.toLowerCase() === '<jesus>') {
      inJesus = true
      if (highlight) result += '<span class="jesus">'
    } else if (part.toLowerCase() === '</jesus>') {
      if (highlight && inJesus) result += '</span>'
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
