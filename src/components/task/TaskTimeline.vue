<template>
  <el-timeline>
    <el-timeline-item
      v-for="item in timeline"
      :key="item.timestamp"
      :timestamp="formatDateTime(item.timestamp)"
      :type="getTimelineType(item.action)"
      placement="top"
    >
      {{ item.detail }}
    </el-timeline-item>
  </el-timeline>
  <el-empty v-if="!timeline.length" description="暂无操作记录" :image-size="80" />
</template>

<script setup>
import { formatDateTime } from '@/utils/dateUtils'

defineProps({
  timeline: { type: Array, default: () => [] }
})

function getTimelineType(action) {
  const map = { created: 'primary', updated: 'warning', completed: 'success' }
  return map[action] || 'info'
}
</script>
