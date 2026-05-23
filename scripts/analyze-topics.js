#!/usr/bin/env node
/**
 * analyze-topics.js
 *
 * Reads web.json, extracts Jesus quotes (<span class="jesus">…</span>),
 * identifies keywords (excluding stop words), groups surface forms by their
 * root/lemma, and writes public/topics.json.
 *
 * Output format:
 *   [
 *     { "topic": "kingdom", "count": 108, "verses": ["Matthew 4:17", ...] },
 *     ...
 *   ]
 *
 * Sorted by count descending.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// Stop Words
// Articles, prepositions, conjunctions, auxiliary/"be" verbs, and pronouns
// ---------------------------------------------------------------------------
const STOP_WORDS = new Set([
  // Articles
  'a', 'an', 'the',

  // Personal pronouns
  'i', 'me', 'my', 'mine', 'myself',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'we', 'us', 'our', 'ours', 'ourselves',
  'they', 'them', 'their', 'theirs', 'themselves',

  // Relative, interrogative, and demonstrative pronouns
  'who', 'whom', 'whose', 'which', 'what', 'that',
  'whoever', 'whatever', 'whichever', 'whomever',
  'this', 'these', 'those',

  // Generic/indefinite pronouns used as function words
  'one', 'ones', 'another', 'other', 'others',

  // "Be" verb and all conjugations
  'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being',

  // Auxiliary verbs (and their conjugations)
  'have', 'has', 'had', 'having',
  'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might',
  'must', 'shall', 'can', 'need', 'dare', 'ought',
  'let',  // used as auxiliary ("let him go")

  // Common prepositions
  'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from',
  'by', 'about', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between',
  'out', 'off', 'over', 'under', 'again', 'further',
  'once', 'against', 'upon', 'among', 'within',
  'without', 'toward', 'towards', 'unto', 'beside', 'besides',
  'behind', 'beyond', 'across', 'along', 'amid', 'amongst',
  'concerning', 'despite', 'except', 'inside', 'outside',
  'per', 'regarding', 'since', 'than', 'throughout',
  'till', 'unlike', 'until', 'up', 'via', 'versus',
  'down', 'away',

  // Conjunctions
  'and', 'but', 'or', 'nor', 'so', 'yet',
  'although', 'because', 'while', 'if', 'unless',
  'whether', 'neither', 'either', 'both', 'not',
  'lest', 'though', 'whereas', 'whenever', 'wherever',

  // Common adverbs / function words
  'also', 'even', 'just', 'still', 'too', 'very', 'only',
  'no', 'all', 'any', 'each', 'every', 'few', 'more', 'most',
  'some', 'such',
  'when', 'where', 'how', 'why', 'then', 'there', 'here',
  'never', 'always', 'often', 'already', 'soon', 'now',
  'truly', 'verily', 'indeed', 'therefore', 'thus', 'hence',
  'much', 'many', 'own', 'same', 'else',

  // Contraction fragments produced after preprocessing
  'dont', 'doesnt', 'didnt', 'wont', 'cant', 'isnt', 'arent',
  'wasnt', 'werent', 'havent', 'hasnt', 'hadnt', 'shouldnt',
  'wouldnt', 'couldnt', 'mightnt', 'mustnt', 'neednt',
  'ca', 'wo', 'ai', 'sha',  // fragments from irregular contractions (can't → ca, won't → wo)
])

// ---------------------------------------------------------------------------
// Irregular Forms Dictionary  (inflected form → base/lemma)
// ---------------------------------------------------------------------------
const IRREGULAR_FORMS = {
  // "Be" verb forms (already in stop words, but map them anyway)
  'was': 'be', 'were': 'be', 'been': 'be', 'being': 'be',
  'am': 'be', 'is': 'be', 'are': 'be',

  // Irregular verbs
  'came': 'come', 'comes': 'come', 'coming': 'come',
  'went': 'go', 'goes': 'go', 'going': 'go',
  'said': 'say', 'says': 'say', 'saying': 'say',
  'saw': 'see', 'seen': 'see', 'sees': 'see', 'seeing': 'see',
  'gave': 'give', 'given': 'give', 'gives': 'give', 'giving': 'give',
  'took': 'take', 'taken': 'take', 'takes': 'take', 'taking': 'take',
  'made': 'make', 'makes': 'make', 'making': 'make',
  'knew': 'know', 'known': 'know', 'knows': 'know', 'knowing': 'know',
  'thought': 'think', 'thinks': 'think', 'thinking': 'think',
  'brought': 'bring', 'brings': 'bring', 'bringing': 'bring',
  'taught': 'teach', 'teaches': 'teach', 'teaching': 'teach',
  'told': 'tell', 'tells': 'tell', 'telling': 'tell',
  'found': 'find', 'finds': 'find', 'finding': 'find',
  'heard': 'hear', 'hears': 'hear', 'hearing': 'hear',
  'kept': 'keep', 'keeps': 'keep', 'keeping': 'keep',
  'left': 'leave', 'leaves': 'leave', 'leaving': 'leave',
  'sent': 'send', 'sends': 'send', 'sending': 'send',
  'stood': 'stand', 'stands': 'stand', 'standing': 'stand',
  'fell': 'fall', 'fallen': 'fall', 'falls': 'fall', 'falling': 'fall',
  'sought': 'seek', 'seeks': 'seek', 'seeking': 'seek',
  'held': 'hold', 'holds': 'hold', 'holding': 'hold',
  'built': 'build', 'builds': 'build', 'building': 'build',
  'wept': 'weep', 'weeps': 'weep', 'weeping': 'weep',
  'rose': 'rise', 'risen': 'rise', 'rises': 'rise', 'rising': 'rise',
  'wrote': 'write', 'written': 'write', 'writes': 'write', 'writing': 'write',
  'spoke': 'speak', 'spoken': 'speak', 'speaks': 'speak', 'speaking': 'speak',
  'ate': 'eat', 'eaten': 'eat', 'eats': 'eat', 'eating': 'eat',
  'drank': 'drink', 'drunk': 'drink', 'drinks': 'drink', 'drinking': 'drink',
  'ran': 'run', 'runs': 'run', 'running': 'run',
  'lost': 'lose', 'loses': 'lose', 'losing': 'lose',
  'led': 'lead', 'leads': 'lead', 'leading': 'lead',
  'bore': 'bear', 'borne': 'bear', 'bears': 'bear', 'bearing': 'bear',
  'chose': 'choose', 'chosen': 'choose', 'chooses': 'choose', 'choosing': 'choose',
  'forgave': 'forgive', 'forgiven': 'forgive', 'forgives': 'forgive', 'forgiving': 'forgive',
  'broke': 'break', 'broken': 'break', 'breaks': 'break', 'breaking': 'break',
  'arose': 'arise', 'arisen': 'arise', 'arises': 'arise', 'arising': 'arise',
  'bound': 'bind', 'binds': 'bind', 'binding': 'bind',
  'drew': 'draw', 'drawn': 'draw', 'draws': 'draw', 'drawing': 'draw',
  'fed': 'feed', 'feeds': 'feed', 'feeding': 'feed',
  'got': 'get', 'gotten': 'get', 'gets': 'get', 'getting': 'get',
  'grew': 'grow', 'grown': 'grow', 'grows': 'grow', 'growing': 'grow',
  'hid': 'hide', 'hidden': 'hide', 'hides': 'hide', 'hiding': 'hide',
  'laid': 'lay', 'lays': 'lay', 'laying': 'lay',
  'lain': 'lie', 'lies': 'lie', 'lying': 'lie',
  'meant': 'mean', 'means': 'mean', 'meaning': 'mean',
  'met': 'meet', 'meets': 'meet', 'meeting': 'meet',
  'paid': 'pay', 'pays': 'pay', 'paying': 'pay',
  'rode': 'ride', 'ridden': 'ride', 'rides': 'ride', 'riding': 'ride',
  'sold': 'sell', 'sells': 'sell', 'selling': 'sell',
  'sat': 'sit', 'sits': 'sit', 'sitting': 'sit',
  'slept': 'sleep', 'sleeps': 'sleep', 'sleeping': 'sleep',
  'swore': 'swear', 'sworn': 'swear', 'swears': 'swear', 'swearing': 'swear',
  'threw': 'throw', 'thrown': 'throw', 'throws': 'throw', 'throwing': 'throw',
  'wore': 'wear', 'worn': 'wear', 'wears': 'wear', 'wearing': 'wear',
  'won': 'win', 'wins': 'win', 'winning': 'win',
  'withdrew': 'withdraw', 'withdrawn': 'withdraw', 'withdraws': 'withdraw',
  'overcame': 'overcome', 'overcoming': 'overcome',
  'entered': 'enter', 'enters': 'enter', 'entering': 'enter',
  'done': 'do', 'doing': 'do',
  'called': 'call', 'calls': 'call', 'calling': 'call',
  'blessed': 'bless', 'blesses': 'bless', 'blessing': 'bless',

  // Irregular plurals
  'children': 'child',
  'men': 'man',
  'women': 'woman',
  'brethren': 'brother',
  'feet': 'foot',
  'teeth': 'tooth',
  'loaves': 'loaf',
  'oxen': 'ox',
  'geese': 'goose',
  'mice': 'mouse',
}

// ---------------------------------------------------------------------------
// Text preprocessing: handle contractions and apostrophes
// ---------------------------------------------------------------------------

/** Unicode curly apostrophes and ASCII apostrophe */
const APOS = String.raw`[\u2018\u2019']`

/**
 * Normalise contractions in a text string so that subsequent word
 * tokenisation does not produce spurious fragments.
 *
 * - n't  → strip (the preceding "n" stays, giving e.g. "do")
 * - 's   → strip (possessive: "father's" → "father")
 * - 've / 're / 'll / 'd / 'm → strip (leaving the pronoun/noun)
 */
function preprocessText(text) {
  const re = new RegExp(APOS, 'g')
  return text
    // n't  (don't → do, didn't → did, won't → wo, can't → ca)
    .replace(new RegExp(`n${APOS}t\\b`, 'gi'), '')
    // possessives and other contraction suffixes
    .replace(new RegExp(`${APOS}(?:s|ve|re|ll|d|m)\\b`, 'gi'), '')
    // strip any remaining apostrophes so the tokeniser sees clean words
    .replace(re, '')
}

// ---------------------------------------------------------------------------
// Lemmatiser: map surface form → base/lemma
// ---------------------------------------------------------------------------

const DOUBLE_CONS = /([b-df-hj-np-tv-z])\1$/
const ENDS_CONS   = /[b-df-hj-np-tv-z]$/

/**
 * Return the base/lemma form of a lowercase English word.
 *
 * Priority:
 *   1. Exact match in the irregular-forms dictionary
 *   2. Suffix rules for -ies, -ing, -ed, -ches/-shes/-xes/-sses, -s
 *   3. Return the word unchanged
 */
function lemmatize(word) {
  if (IRREGULAR_FORMS[word]) return IRREGULAR_FORMS[word]

  const len = word.length
  if (len <= 3) return word

  // -ies → -y  (glorifies → glorify, tries → try)
  if (word.endsWith('ies') && len >= 5) return word.slice(0, -3) + 'y'

  // -ing → base  (praying → pray, loving → love, running → run)
  if (word.endsWith('ing') && len >= 6) {
    const stem = word.slice(0, -3)
    // Double consonant added before -ing: running → run
    if (DOUBLE_CONS.test(stem) && stem.length >= 3) return stem.slice(0, -1)
    // Stem ends in consonant: add 'e' back (loving → love, making → make)
    if (stem.length >= 3 && ENDS_CONS.test(stem)) return stem + 'e'
    return stem  // praying → pray, healing → heal
  }

  // -ed → base  (loved → love, walked → walk, blessed → bless)
  if (word.endsWith('ed') && len >= 5) {
    const stem = word.slice(0, -2)
    // Double consonant: stopped → stop
    if (DOUBLE_CONS.test(stem) && stem.length >= 3) return stem.slice(0, -1)
    // Stem ends in consonant: add 'e' back
    if (ENDS_CONS.test(stem)) return stem + 'e'
    return stem  // seemed → seem, healed → heal
  }

  // -ches / -shes / -xes / -zes / -sses → remove 'es'
  // (churches → church, washes → wash, foxes → fox, classes → class)
  if (
    (word.endsWith('ches') || word.endsWith('shes') ||
     word.endsWith('xes')  || word.endsWith('zes')  ||
     word.endsWith('sses')) &&
    len >= 5
  ) return word.slice(0, -2)

  // -s → singular  (kingdoms → kingdom, servants → servant)
  // but skip -ss endings (class, grass) and words <= 3 chars
  if (word.endsWith('s') && !word.endsWith('ss') && len >= 4) {
    return word.slice(0, -1)
  }

  return word
}

// ---------------------------------------------------------------------------
// Main analysis
// ---------------------------------------------------------------------------

const SPAN_RE = /<span class="jesus">([\s\S]*?)<\/span>/g
const WORD_RE = /[a-zA-Z]+/g

function extractKeywords(spanText) {
  const cleaned = preprocessText(spanText)
  const tokens = cleaned.match(WORD_RE) || []
  return tokens
    .map(t => t.toLowerCase())
    .filter(t => t.length >= 2)
    .filter(t => !STOP_WORDS.has(t))
    .map(t => lemmatize(t))
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t))
}

function analyze(webJsonPath) {
  const raw = readFileSync(webJsonPath, 'utf8')
  const data = JSON.parse(raw)

  // topic key (lemma) → { count, verses (Set of "Book Chapter:Verse") }
  const topics = new Map()

  for (const [book, bookData] of Object.entries(data)) {
    for (const chapterObj of bookData.chapters) {
      const chapter = chapterObj.chapter
      for (const passageObj of chapterObj.passages) {
        const verse = passageObj.verse
        const verseRef = `${book} ${chapter}:${verse}`
        const text = passageObj.text

        // Collect all jesus-span content for this passage
        const spanTexts = []
        let match
        SPAN_RE.lastIndex = 0
        while ((match = SPAN_RE.exec(text)) !== null) {
          spanTexts.push(match[1])
        }

        if (spanTexts.length === 0) continue

        // Deduplicate keywords per verse to avoid inflating verse-level counts
        const verseKeywords = new Set()
        for (const spanText of spanTexts) {
          for (const keyword of extractKeywords(spanText)) {
            verseKeywords.add(keyword)
          }
        }

        for (const keyword of verseKeywords) {
          if (!topics.has(keyword)) {
            topics.set(keyword, { count: 0, verses: new Set() })
          }
          const entry = topics.get(keyword)
          entry.count++
          entry.verses.add(verseRef)
        }
      }
    }
  }

  // Convert to sorted array
  const result = Array.from(topics.entries())
    .map(([topic, { count, verses }]) => ({
      topic,
      count,
      verses: Array.from(verses),
    }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))

  return result
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const webJsonPath  = resolve(ROOT, 'web.json')
const outDir       = resolve(ROOT, 'public')
const outPath      = resolve(outDir, 'topics.json')

mkdirSync(outDir, { recursive: true })

const topics = analyze(webJsonPath)
writeFileSync(outPath, JSON.stringify(topics, null, 2) + '\n', 'utf8')

console.log(`✓  Wrote ${topics.length} topics to ${outPath}`)
