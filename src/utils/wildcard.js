/**
 * Convert a wildcard pattern to a RegExp.
 * Supported: * ? [set] [!set] # and - for ranges inside brackets.
 */
export function wildcardToRegex(pattern) {
  let regex = ''
  let i = 0
  while (i < pattern.length) {
    const ch = pattern[i]
    if (ch === '*') {
      regex += '.*'
    } else if (ch === '?') {
      regex += '.'
    } else if (ch === '#') {
      regex += '\\d'
    } else if (ch === '[') {
      const end = pattern.indexOf(']', i)
      if (end === -1) {
        regex += '\\['
        i++
        continue
      }
      let inner = pattern.slice(i + 1, end)
      if (inner.startsWith('!')) {
        inner = '^' + inner.slice(1)
      }
      regex += '[' + inner + ']'
      i = end + 1
      continue
    } else {
      regex += ch.replace(/[.+^${}()|\\[\]]/g, '\\$&')
    }
    i++
  }
  return new RegExp(regex, 'i')
}

/**
 * Test whether a text matches a wildcard pattern.
 * If the pattern contains no wildcard characters, falls back to case-insensitive substring match.
 */
export function matchesWildcard(text, pattern) {
  if (!pattern) return true
  const hasWildcard = /[*?#\[]/.test(pattern)
  if (!hasWildcard) {
    return text.toLowerCase().includes(pattern.toLowerCase())
  }
  try {
    return wildcardToRegex(pattern).test(text)
  } catch {
    return false
  }
}
