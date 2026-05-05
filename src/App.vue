<template>
  <div class="app">
    <header class="app-header">
      <h1>{{ t('appTitle') }}</h1>
      <nav class="tabs">
        <button :class="['tab', { active: tab === 'graph' }]" @click="tab = 'graph'">{{ t('tabs.graph') }}</button>
        <button :class="['tab', { active: tab === 'sources' }]" @click="tab = 'sources'">{{ t('tabs.sources') }}</button>
      </nav>
      <span v-if="tab === 'graph'" class="status">
        {{ t('status', { n: graphData.nodes.length, m: graphData.links.length }) }}
      </span>
      <div class="lang-switch">
        <button :class="['lang-btn', { active: locale === 'en' }]" @click="locale = 'en'">{{ t('lang.en') }}</button>
        <span class="lang-sep">|</span>
        <button :class="['lang-btn', { active: locale === 'pl' }]" @click="locale = 'pl'">{{ t('lang.pl') }}</button>
      </div>

      <!--
        TODO Task 3 — Live Graph Search
        Add a search <input> here. Pass the query string down to <Graph> as a
        new `filterQuery` prop. When the query is non-empty:
          • Nodes whose title matches (case-insensitive) render at full opacity.
          • All other nodes are dimmed to ~20% opacity inside nodeCanvasObject.
          • Show "N matches" count here and an × clear button.
        Keyboard: "/" focuses the input; Escape clears it.
        Hint: no re-init needed — the canvas loop already reads props every frame.
      -->
    </header>

    <div v-if="tab === 'graph'" class="app-body">
      <div class="graph-pane">
        <Graph
          :data="graphData"
          :selected-slug="selectedSlug"
          @select="onSelect"
        />
      </div>
      <div :class="['detail-pane', { open: !!selectedSlug }]">
        <div v-if="chunkLoading" class="panel-loading">{{ t('loading') }}</div>
        <ChunkPanel
          v-else-if="chunk"
          :chunk="chunk"
          @navigate="selectedSlug = $event"
          @close="selectedSlug = null"
        />
        <div v-else class="empty-state">{{ t('emptyState') }}</div>
      </div>
    </div>

    <SourcesView v-if="tab === 'sources'" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { graphData, getChunk } from './data/mock.js'
import Graph from './components/Graph.vue'
import ChunkPanel from './components/ChunkPanel.vue'
import SourcesView from './components/SourcesView.vue'

const { t, locale } = useI18n()

const tab = ref('graph')
const selectedSlug = ref(null)
const chunk = ref(null)
const chunkLoading = ref(false)

function onSelect(slug) {
  selectedSlug.value = selectedSlug.value === slug ? null : slug
}

watch(selectedSlug, async (slug) => {
  if (!slug) { chunk.value = null; return }
  chunkLoading.value = true
  await new Promise(r => setTimeout(r, 80))
  chunk.value = getChunk(slug)
  chunkLoading.value = false
})
</script>
