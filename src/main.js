import { ViteSSG } from 'vite-ssg/single-page'
import App from './App.vue'
import './assets/style.css'

// `export const createApp` is required by vite-ssg instead of createApp(App).mount('#app')
export const createApp = ViteSSG(App, async ({ app, isClient, initialState }) => {
  if (!isClient) {
    // SSG build-time only: read the scripture data from disk so the pre-rendered
    // HTML contains the full passage text for search-engine indexing.
    // This branch is dead code in the client bundle (tree-shaken by Rollup).
    const { readFileSync } = await import('fs')
    initialState.webData = JSON.parse(readFileSync('./public/web.json', 'utf-8'))
  }
  // Provide the pre-loaded data to the app. On the client, vite-ssg restores
  // initialState from window.__INITIAL_STATE__ so no second fetch is needed.
  app.provide('initialWebData', initialState.webData ?? null)
})
