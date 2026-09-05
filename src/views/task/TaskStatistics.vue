<template>
  <div class="page-container">
    <h2>任务统计</h2>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #409eff;">{{ stats.total }}</div>
          <div class="stat-label">总任务数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #e6a23c;">{{ stats.byStatus.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #67c23a;">{{ stats.byStatus.completed }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value" style="color: #f56c6c;">{{ stats.byStatus.overdue }}</div>
          <div class="stat-label">已逾期</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card>
          <template #header>按状态分布</template>
          <div class="chart-bars" v-loading="loading">
            <div v-for="(item, key) in statusChartData" :key="key" class="bar-item">
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
              </div>
              <div class="bar-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>按优先级分布</template>
          <div class="chart-bars" v-loading="loading">
            <div v-for="(item, key) in priorityChartData" :key="key" class="bar-item">
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
              </div>
              <div class="bar-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card>
          <template #header>按人员任务数排名</template>
          <div class="chart-bars" v-loading="loading">
            <div v-for="item in personChartData" :key="item.name" class="bar-item">
              <div class="bar-label" style="width: 80px;">{{ item.name }}</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.percent + '%', background: '#409eff' }"></div>
              </div>
              <div class="bar-value">{{ item.value }}</div>
            </div>
          </div>
          <el-empty v-if="!personChartData.length && !loading" description="暂无任务数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useTaskStore } from '@/stores/task'
import { usePersonnelStore } from '@/stores/personnel'

const taskStore = useTaskStore()
const personnelStore = usePersonnelStore()

const loading = ref(false)

const stats = computed(() => taskStore.taskStats)

const statusChartData = computed(() => {
  const max = Math.max(stats.value.total, 1)
  return [
    { label: '待处理', value: stats.value.byStatus.pending, percent: (stats.value.byStatus.pending / max) * 100, color: '#909399' },
    { label: '进行中', value: stats.value.byStatus.inProgress, percent: (stats.value.byStatus.inProgress / max) * 100, color: '#e6a23c' },
    { label: '已完成', value: stats.value.byStatus.completed, percent: (stats.value.byStatus.completed / max) * 100, color: '#67c23a' },
    { label: '已逾期', value: stats.value.byStatus.overdue, percent: (stats.value.byStatus.overdue / max) * 100, color: '#f56c6c' },
  ]
})

const priorityChartData = computed(() => {
  const max = Math.max(stats.value.total, 1)
  return [
    { label: '高优先级', value: stats.value.byPriority.high, percent: (stats.value.byPriority.high / max) * 100, color: '#f56c6c' },
    { label: '中优先级', value: stats.value.byPriority.medium, percent: (stats.value.byPriority.medium / max) * 100, color: '#e6a23c' },
    { label: '低优先级', value: stats.value.byPriority.low, percent: (stats.value.byPriority.low / max) * 100, color: '#909399' },
  ]
})

const personChartData = computed(() => {
  const countMap = {}
  taskStore.tasks.forEach(t => {
    if (t.assignee_id) {
      countMap[t.assignee_id] = (countMap[t.assignee_id] || 0) + 1
    }
  })
  const list = Object.entries(countMap).map(([id, count]) => ({
    name: personnelStore.personnelById(id)?.name || '未知',
    value: count
  })).sort((a, b) => b.value - a.value).slice(0, 10)

  const max = Math.max(...list.map(i => i.value), 1)
  list.forEach(item => { item.percent = (item.value / max) * 100 })
  return list
})

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      taskStore.fetchStatistics(),
      personnelStore.fetchPersonnel()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bar-label {
  width: 70px;
  font-size: 13px;
  color: #606266;
  text-align: right;
  flex-shrink: 0;
}
.bar-track {
  flex: 1;
  height: 20px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
  min-width: 2px;
}
.bar-value {
  width: 30px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  text-align: right;
}
</style>
