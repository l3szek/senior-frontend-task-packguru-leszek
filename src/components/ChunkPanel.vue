<template>
  <div class="chunk-panel">
    <div class="panel-header">
      <div class="panel-title">
        <span :class="`type-badge type-${chunk.type}`">{{ typeLabel }}</span>
        <h2>{{ chunk.title }}</h2>
        <p v-if="chunk.summary" class="summary">{{ chunk.summary }}</p>
      </div>
      <button class="close-btn" :title="t('part.close')" @click="emit('close')">&#x2715;</button>
    </div>

    <div class="panel-body">
      <div v-if="chunk.body_markdown" class="markdown-content" v-html="parsedBody" />

      <section v-if="outLinks.length || inLinks.length" class="panel-section">
        <h3>{{ t('chunk.relatedChunks') }}</h3>
        <div v-if="outLinks.length" class="link-group">
          <h4>{{ t('chunk.linksTo') }}</h4>
          <ul class="link-list">
            <li v-for="l in outLinks" :key="l.slug">
              <button class="link-btn" @click="emit('navigate', l.slug)">{{ l.title }}</button>
              <span v-if="l.label" class="link-label">{{ l.label }}</span>
            </li>
          </ul>
        </div>
        <div v-if="inLinks.length" class="link-group">
          <h4>{{ t('chunk.referencedBy') }}</h4>
          <ul class="link-list">
            <li v-for="l in inLinks" :key="l.slug">
              <button class="link-btn" @click="emit('navigate', l.slug)">{{ l.title }}</button>
              <span v-if="l.label" class="link-label">{{ l.label }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section v-if="chunk.sources.length" class="panel-section">
        <h3>{{ t('chunk.sources') }}</h3>
        <ul class="source-list">
          <li v-for="(s, i) in chunk.sources" :key="i" class="source-item">
            <span class="source-name">{{ s.source_name }}</span>
            <span class="source-meta">
              {{ t('chunk.part') }} {{ s.part_index }}{{ timeRange(s.start_seconds, s.end_seconds) }}
            </span>
            <p v-if="s.note" class="source-note">{{ s.note }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import { useI18n } from 'vue-i18n'
import { fmtTime } from '../utils/format.js'
import { TYPE_LABELS } from '../utils/types.js'

const { t } = useI18n()

function timeRange(start, end) {
  const s = fmtTime(start)
  const e = fmtTime(end)
  return s ? ` · ${s} – ${e}` : ''
}

const props = defineProps({
  chunk: { type: Object, required: true },
})
const emit = defineEmits(['navigate', 'close'])

const typeLabel  = computed(() => t(TYPE_LABELS[props.chunk.type] || props.chunk.type))
const outLinks   = computed(() => props.chunk.links.filter(l => l.direction === 'out'))
const inLinks    = computed(() => props.chunk.links.filter(l => l.direction === 'in'))
const parsedBody = computed(() => marked.parse(props.chunk.body_markdown || ''))
</script>
