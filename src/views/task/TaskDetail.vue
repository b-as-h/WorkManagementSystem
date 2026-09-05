<template>
  <div class="page-container">
    <el-page-header @back="router.back()" :title="'返回'" :content="task?.title || '任务详情'" />

    <template v-if="task">
      <el-row :gutter="16" style="margin-top: 20px;">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: 600;">{{ task.title }}</span>
                <div style="display: flex; gap: 8px;">
                  <TaskStatusTag :status="task.status" />
                  <TaskPriorityTag :priority="task.priority" />
                </div>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="负责人">{{ task.assignee_name || '未分配' }}</el-descriptions-item>
              <el-descriptions-item label="部门">{{ task.department_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="分类">{{ task.category || '未分类' }}</el-descriptions-item>
              <el-descriptions-item label="截止日期">
                <span :style="{ color: isOverdue ? '#f56c6c' : '' }">{{ task.deadline || '未设置' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ task.created_at }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ task.updated_at }}</el-descriptions-item>
              <el-descriptions-item label="完成时间" :span="2">{{ task.completed_at || '未完成' }}</el-descriptions-item>
              <el-descriptions-item label="任务描述" :span="2">{{ task.description || '无描述' }}</el-descriptions-item>
            </el-descriptions>

            <div style="margin-top: 16px; display: flex; gap: 8px;">
              <el-button v-if="task.status === 'pending'" type="warning" @click="changeStatus('inProgress')">开始处理</el-button>
              <el-button v-if="task.status !== 'completed'" type="success" @click="changeStatus('completed')">标记完成</el-button>
              <el-button v-if="task.status === 'completed'" type="info" @click="changeStatus('pending')">重新打开</el-button>
              <el-button @click="showEditDialog = true">编辑</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card>
            <template #header>操作时间线</template>
            <TaskTimeline :timeline="task.timeline || []" />
          </el-card>
        </el-col>
      </el-row>
    </template>

    <el-empty v-else-if="!loading" description="任务不存在" />

    <!-- 编辑弹窗 -->
    <el-dialog title="编辑任务" v-model="showEditDialog" width="550px">
      <TaskForm ref="taskFormRef" :initial-data="task || {}" :personnel-list="personnelList" />
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEdit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useTaskStore } from '@/stores/task'
import { usePersonnelStore } from '@/stores/personnel'
import TaskStatusTag from '@/components/task/TaskStatusTag.vue'
import TaskPriorityTag from '@/components/task/TaskPriorityTag.vue'
import TaskTimeline from '@/components/task/TaskTimeline.vue'
import TaskForm from '@/components/task/TaskForm.vue'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const personnelStore = usePersonnelStore()

const showEditDialog = ref(false)
const taskFormRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const task = ref(null)

const personnelList = computed(() => personnelStore.personnel)

const isOverdue = computed(() => {
  return task.value && task.value.deadline && new Date(task.value.deadline) < new Date() && task.value.status !== 'completed'
})

async function loadTask() {
  loading.value = true
  try {
    const data = await taskStore.fetchTaskById(route.params.id)
    task.value = data
  } catch (error) {
    ElMessage.error('获取任务详情失败')
  } finally {
    loading.value = false
  }
}

async function changeStatus(newStatus) {
  try {
    await taskStore.changeTaskStatus(task.value.id, newStatus)
    const labels = { inProgress: '进行中', completed: '已完成', pending: '待处理' }
    ElMessage.success(`任务已标记为${labels[newStatus]}`)
    await loadTask() // 刷新数据
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

async function handleEdit() {
  const valid = await taskFormRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    const data = taskFormRef.value.getData()
    await taskStore.updateTask(task.value.id, data)
    ElMessage.success('任务已更新')
    showEditDialog.value = false
    await loadTask() // 刷新数据
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadTask(),
    personnelStore.fetchPersonnel(),
    personnelStore.fetchDepartmentTree()
  ])
})
</script>
