<template>
  <div class="page-container">
    <h2>仪表盘</h2>
    <p style="color: #909399; margin-top: 4px;">欢迎回来，{{ appStore.currentUser?.name || '用户' }}</p>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-top: 20px;">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value" style="color: #409eff;">{{ taskStats.total }}</div>
          <div class="stat-label">总任务数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value" style="color: #e6a23c;">{{ taskStats.byStatus.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value" style="color: #67c23a;">{{ taskStats.byStatus.completed }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value" style="color: #f56c6c;">{{ taskStats.byStatus.overdue }}</div>
          <div class="stat-label">已逾期</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <!-- 待办任务 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>待办任务</span>
              <el-link type="primary" @click="router.push('/task')">查看全部</el-link>
            </div>
          </template>
          <el-table :data="recentTasks" stripe size="small" :show-header="true" v-loading="taskLoading">
            <el-table-column prop="title" label="任务名称" min-width="180">
              <template #default="{ row }">
                <el-link type="primary" @click="router.push(`/task/${row.id}`)">{{ row.title }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="80">
              <template #default="{ row }">
                <TaskPriorityTag :priority="row.priority" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <TaskStatusTag :status="row.status" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="deadline" label="截止日期" width="110">
              <template #default="{ row }">
                <span :style="{ color: isTaskOverdue(row) ? '#f56c6c' : '' }">{{ row.deadline || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!recentTasks.length && !taskLoading" description="暂无待办任务" :image-size="60" />
        </el-card>
      </el-col>

      <!-- 概览信息 -->
      <el-col :span="10">
        <el-card style="margin-bottom: 16px;">
          <template #header>人员概览</template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="总人数">{{ personnelStore.personnel.length }}</el-descriptions-item>
            <el-descriptions-item label="部门数">{{ personnelStore.departments.length }}</el-descriptions-item>
            <el-descriptions-item label="在职人数">
              {{ personnelStore.personnel.filter(p => p.status === 'active').length }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card>
          <template #header>快速操作</template>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <el-button type="primary" @click="router.push('/task')" style="width: 100%;">
              <el-icon><Plus /></el-icon> 创建新任务
            </el-button>
            <el-button @click="router.push('/personnel')" style="width: 100%;">
              <el-icon><User /></el-icon> 管理人员
            </el-button>
            <el-button @click="router.push('/task/statistics')" style="width: 100%;">
              <el-icon><DataAnalysis /></el-icon> 查看统计
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import { useTaskStore } from '@/stores/task'
import { usePersonnelStore } from '@/stores/personnel'
import TaskStatusTag from '@/components/task/TaskStatusTag.vue'
import TaskPriorityTag from '@/components/task/TaskPriorityTag.vue'

const router = useRouter()
const appStore = useAppStore()
const taskStore = useTaskStore()
const personnelStore = usePersonnelStore()

const taskLoading = ref(false)

const taskStats = computed(() => taskStore.taskStats)

const recentTasks = computed(() => {
  return taskStore.tasks
    .filter(t => t.status !== 'completed')
    .slice(0, 5)
})

function isTaskOverdue(task) {
  return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'
}

// 页面加载时获取数据
onMounted(async () => {
  taskLoading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      taskStore.fetchStatistics(),
      personnelStore.fetchAllData()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请检查后端服务是否启动')
  } finally {
    taskLoading.value = false
  }
})
</script>
