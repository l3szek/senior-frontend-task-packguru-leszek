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
      <div v-if="tab === 'graph'" class="search-wrap">
        <input
          ref="searchInput"
          v-model="filterQuery"
          class="search-input"
          :placeholder="t('search.placeholder')"
        />
        <span v-if="filterQuery" class="search-matches">
          {{ t('search.matches', { n: matchCount }, matchCount) }}
        </span>
        <button v-if="filterQuery" class="search-clear" :aria-label="t('search.clear')" @click="filterQuery = ''">&times;</button>
      </div>
      <div class="lang-switch">
        <button :class="['lang-btn', { active: locale === 'en' }]" @click="locale = 'en'">{{ t('lang.en') }}</button>
        <span class="lang-sep">|</span>
        <button :class="['lang-btn', { active: locale === 'pl' }]" @click="locale = 'pl'">{{ t('lang.pl') }}</button>
      </div>
    </header>

    <div v-if="tab === 'graph'" class="app-body">
      <div class="graph-pane">
        <Graph
          :data="graphData"
          :selected-slug="selectedSlug"
          :filter-query="filterQuery"
          :reset-path="resetPath"
          @select="onSelect"
          @clear-filter="onClearFilter"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

const filterQuery = ref('')
const resetPath = ref(false)
const searchInput = ref(null)

const matchCount = computed(() => {
  if (!filterQuery.value) return 0
  return graphData.nodes.filter(n =>
    n.title.toLowerCase().includes(filterQuery.value.toLowerCase())
  ).length
})

watch(filterQuery, (newVal, oldVal) => {
  if (newVal && !oldVal) resetPath.value = !resetPath.value
})

function onClearFilter() {
  filterQuery.value = ''
}

function handleKey(e) {
  if (tab.value !== 'graph') return
  if (e.key === '/' && document.activeElement !== searchInput.value) {
    e.preventDefault()
    searchInput.value?.focus()
  } else if (e.key === 'Escape' && filterQuery.value) {
    filterQuery.value = ''
    searchInput.value?.blur()
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))

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
