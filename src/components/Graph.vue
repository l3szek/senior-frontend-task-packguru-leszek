<template>
  <div style="width:100%;height:100%;position:relative">
    <div ref="containerEl" style="width:100%;height:100%" />
    <button
      :class="['path-toggle', { active: pathMode }]"
      @click="togglePathMode"
    >{{ t('path.toggle') }}</button>
    <div v-if="pathMode && pathHint" class="path-hint-overlay">
      {{ pathHint }}
    </div>
    <div v-if="pathMode && noPathFound" class="no-path-overlay">
      {{ t('path.noPath') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ForceGraph from 'force-graph'
import { TYPE_COLORS } from '../utils/types.js'

const DEFAULT_COLOR = '#95a5a6'

const props = defineProps({
  data:         { type: Object, default: () => ({ nodes: [], links: [] }) },
  selectedSlug: { type: String, default: null },
  // Task 3: add filterQuery prop here and use it in nodeCanvasObject
  // filterQuery: { type: String, default: '' },
})
const { t } = useI18n()
const emit = defineEmits(['select', 'clearFilter'])

const containerEl = ref(null)
let fg = null

const pathMode = ref(false)
const pathStep = ref(0)   // 0=idle 1=awaiting start 2=awaiting end
const pathStart = ref(null)
const pathEnd = ref(null)
const pathNodeSlugs = ref(new Set())
const pathLinkIds = ref(new Set())
const noPathFound = ref(false)

const pathHint = computed(() => {
  if (!pathMode.value) return ''
  if (pathNodeSlugs.value.size > 0 || noPathFound.value) return ''
  if (pathStep.value === 1) return t('path.selectStart')
  if (pathStep.value === 2) return t('path.selectEnd')
  return ''
})

function nodeColor(node) {
  return TYPE_COLORS[node.type] || DEFAULT_COLOR
}

function slugOf(node) {
  return node?.slug ?? node
}

function bfs(startSlug, endSlug, links) {
  const adj = new Map()
  for (const link of links) {
    const s = slugOf(link.source)
    const tgt = slugOf(link.target)
    if (!adj.has(s)) adj.set(s, [])
    if (!adj.has(tgt)) adj.set(tgt, [])
    adj.get(s).push(tgt)
    adj.get(tgt).push(s)
  }
  const visited = new Set([startSlug])
  const prev = new Map()
  const queue = [startSlug]
  while (queue.length) {
    const curr = queue.shift()
    if (curr === endSlug) {
      const path = []
      let node = endSlug
      while (node !== undefined) {
        path.unshift(node)
        node = prev.get(node)
      }
      return path
    }
    for (const nb of (adj.get(curr) ?? [])) {
      if (!visited.has(nb)) {
        visited.add(nb)
        prev.set(nb, curr)
        queue.push(nb)
      }
    }
  }
  return null
}

function togglePathMode() {
  if (pathMode.value) {
    pathMode.value = false
    pathStep.value = 0
    pathStart.value = null
    pathEnd.value = null
    pathNodeSlugs.value = new Set()
    pathLinkIds.value = new Set()
    noPathFound.value = false
  } else {
    pathMode.value = true
    pathStep.value = 1
    emit('clearFilter')
  }
}

onMounted(() => {
  fg = ForceGraph()(containerEl.value)
    .graphData(props.data)
    .nodeId('slug')
    .nodeLabel('title')
    .linkColor(link => {
      if (!pathMode.value || pathLinkIds.value.size === 0) return '#334455'
      const id = slugOf(link.source) + '→' + slugOf(link.target)
      return pathLinkIds.value.has(id) ? '#f39c12' : 'rgba(51,68,85,0.2)'
    })
    .linkWidth(link => {
      if (!pathMode.value || pathLinkIds.value.size === 0) return 1
      const id = slugOf(link.source) + '→' + slugOf(link.target)
      return pathLinkIds.value.has(id) ? 2 : 0.3
    })
    .linkDirectionalArrowLength(3)
    .linkDirectionalArrowRelPos(1)
    .linkLabel('label')
    .backgroundColor('#1a1a2e')
    .onNodeClick(node => {
      if (!pathMode.value) {
        emit('select', node.slug)
        return
      }
      if (pathStep.value === 1) {
        pathStart.value = node.slug
        pathEnd.value = null
        pathNodeSlugs.value = new Set()
        pathLinkIds.value = new Set()
        noPathFound.value = false
        pathStep.value = 2
      } else {
        pathEnd.value = node.slug
        const path = bfs(pathStart.value, node.slug, fg.graphData().links)
        if (path) {
          pathNodeSlugs.value = new Set(path)
          const ids = new Set()
          for (let i = 0; i < path.length - 1; i++) {
            ids.add(path[i] + '→' + path[i + 1])
            ids.add(path[i + 1] + '→' + path[i])
          }
          pathLinkIds.value = ids
          noPathFound.value = false
        } else {
          pathNodeSlugs.value = new Set()
          pathLinkIds.value = new Set()
          noPathFound.value = true
        }
        pathStep.value = 1
      }
    })
    .nodeCanvasObject((node, ctx, globalScale) => {
      const isSelected = node.slug === props.selectedSlug
      const inPath = pathMode.value && pathNodeSlugs.value.has(node.slug)
      const isPathStart = pathMode.value && pathStart.value === node.slug
      const awaitingEnd = pathMode.value
        && pathStep.value === 2
        && pathStart.value != null
        && pathNodeSlugs.value.size === 0
      const dimmed =
        (pathMode.value && pathNodeSlugs.value.size > 0 && !inPath) ||
        (awaitingEnd && !isPathStart)

      if (dimmed) ctx.globalAlpha = 0.2

      const color = nodeColor(node)
      const r = isSelected ? 7 : 4

      ctx.beginPath()
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()

      if (isSelected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 2.5, 0, 2 * Math.PI)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      if (inPath) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      if (isPathStart) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = '#f39c12'
        ctx.lineWidth = 2.5
        ctx.stroke()
      }

      if (globalScale >= 1.2) {
        const fontSize = Math.min(12 / globalScale, 3)
        ctx.font = `${fontSize}px Sans-Serif`
        ctx.fillStyle = 'rgba(220,220,220,0.85)'
        ctx.textAlign = 'center'
        ctx.fillText(node.title, node.x, node.y + r + fontSize + 1)
      }

      if (dimmed) ctx.globalAlpha = 1
    })
    .nodeCanvasObjectMode(() => 'replace')

  const { width, height } = containerEl.value.getBoundingClientRect()
  if (width && height) fg.width(width).height(height)

  watch(pathMode, on => {
    if (!fg) return
    fg.enableNodeDrag(!on)
  }, { immediate: true })

  watch(
    [pathStep, pathStart, pathNodeSlugs, pathLinkIds, noPathFound, pathMode],
    () => fg?.d3ReheatSimulation(),
  )

  const ro = new ResizeObserver(([e]) => {
    fg?.width(e.contentRect.width).height(e.contentRect.height)
  })
  ro.observe(containerEl.value)
  onUnmounted(() => ro.disconnect())
})

onUnmounted(() => {
  fg?.pauseAnimation()
  fg = null
})

watch(() => props.data, d => fg?.graphData(d))

watch(() => props.selectedSlug, slug => {
  if (!slug || !fg) return
  const node = fg.graphData().nodes.find(n => n.slug === slug)
  if (node?.x != null) fg.centerAt(node.x, node.y, 400)
})



</script>


<style scoped>
.path-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  padding: 4px 10px;
  background: #2a2a4a;
  color: #ccc;
  border: 1px solid #445;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.path-toggle.active {
  background: #f39c12;
  color: #1a1a2e;
  border-color: #f39c12;
}
.no-path-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 26, 46, 0.85);
  color: #e74c3c;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  pointer-events: none;
}
.path-hint-overlay {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 26, 46, 0.85);
  color: #f39c12;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
}
</style>
