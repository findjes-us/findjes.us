<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mt-6">
    <p class="text-sm font-medium text-gray-700 mb-3">
      View in other Bible Translation:
    </p>
    <div class="flex items-center gap-3 flex-wrap">
      <select
        v-model="selectedVersion"
        class="border border-gray-300 rounded-md text-sm px-2 py-1.5 bg-white focus:ring-2 focus:ring-jesuspurple-500 outline-none"
      >
        <option value="KJV">
          King James Version (KJV)
        </option>
        <option value="NASB">
          New American Standard Bible (NASB)
        </option>
        <option value="NIV">
          New International Version (NIV)
        </option>
      </select>
      <button
        class="flex items-center gap-1.5 bg-violet-300 hover:bg-violet-400 text-black text-sm font-medium px-4 py-1.5 rounded-lg shadow-sm transition-colors"
        @click="lookUp"
      >
        <IconSearch class="w-4 h-4" />
        Look Up
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { IconSearch } from '@tabler/icons-vue'

const props = defineProps({
  passageRef: {
    type: String,
    required: true,
  },
})

const selectedVersion = ref('KJV')

function lookUp() {
  const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(props.passageRef)}&version=${selectedVersion.value}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
