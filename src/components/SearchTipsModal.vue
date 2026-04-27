<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
      <button
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        aria-label="Close"
        @click="emit('close')"
      >
        <IconX class="w-5 h-5" />
      </button>
      <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <IconHelp class="w-5 h-5 text-indigo-500" />
        Search Tips &amp; Wildcards
      </h2>
      <div class="space-y-3 text-sm text-gray-700">
        <div
          v-for="tip in tips"
          :key="tip.symbol"
          class="flex gap-3"
        >
          <code class="w-16 flex-shrink-0 font-mono bg-gray-100 rounded px-2 py-0.5 text-center text-indigo-700">{{ tip.symbol }}</code>
          <span>{{ tip.description }} <em class="text-gray-500">e.g. <code class="font-mono bg-gray-100 px-1 rounded">{{ tip.example }}</code></em></span>
        </div>
        <p class="mt-4 text-gray-500 text-xs">
          Plain text searches are case-insensitive substring matches. Wildcards apply to the full verse text.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconX, IconHelp } from '@tabler/icons-vue'

defineEmits(['close'])

const tips = [
  { symbol: '*', description: 'Matches any sequence of characters (zero or more).', example: 'king*dom' },
  { symbol: '?', description: 'Matches exactly one character.', example: 'lo?e' },
  { symbol: '#', description: 'Matches exactly one digit (0–9).', example: 'verse #' },
  { symbol: '[abc]', description: 'Matches any single character in the brackets.', example: '[Hh]eaven' },
  { symbol: '[!abc]', description: 'Matches any single character NOT in the brackets.', example: '[!aeiou]ord' },
  { symbol: 'a-z', description: 'Range inside brackets: matches characters from a to z.', example: '[a-m]ord' },
]
</script>
