<template>
  <section class="max-w-2xl mx-auto py-10 px-4 space-y-6 text-gray-800">
    <h1 class="text-3xl font-bold text-jesuspurple-700 flex items-center gap-3">
      <IconInfoCircle class="w-8 h-8" />
      About FindJes.us
    </h1>
    <p class="text-base leading-relaxed">
      <strong>FindJes.us</strong> is a free, open-source tool for reading the passages from the
      <em>World English Bible (WEB)</em> that directly quote or describe the teachings and
      observed actions of Jesus of Nazareth.
    </p>
    <p class="text-base leading-relaxed">
      The <strong>World English Bible</strong> translation was chosen because it is in the
      <strong>public domain</strong> — it may be freely used, shared, and reproduced without
      copyright restriction. Learn more at
      <a
        href="https://worldenglish.bible"
        target="_blank"
        rel="noopener"
        class="text-jesuspurple-600 underline hover:text-jesuspurple-800"
      >worldenglish.bible</a>.
    </p>
    <p class="text-base leading-relaxed">
      This website is a <strong>not-for-profit, open-source</strong> resource. No data is
      collected, no ads are shown, and no money is made.
    </p>
    <p class="text-base leading-relaxed">
      Interested in contributing or reporting an issue? Visit the project on GitHub:
    </p>
    <a
      href="https://github.com/findjes-us/findjes.us"
      target="_blank"
      rel="noopener"
      class="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
    >
      <IconBrandGithub class="w-5 h-5" />
      findjes-us/findjes.us on GitHub
    </a>
  </section>
</template>

<script setup>
import { IconInfoCircle, IconBrandGithub } from '@tabler/icons-vue'
</script>
