<template>
  <div class="page-container">
    <div class="table-header">
      <h2>任务列表</h2>
      <div class="search-area">
        <el-input v-model="searchText" placeholder="搜索任务名称" prefix-icon="Search" clearable style="width: 200px;" />
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 120px;">
          <el-option label="待处理" value="pending" />
          <el-option label="进行中" value="inProgress" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-select v-model="filterPriority" placeholder="优先级" clearable style="width: 100px;">
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
        <el-button type="primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon> 新建任务
        </el-button>
      </div>
    </div>

    <el-table :data="filteredTasks" stripe style="width: 100%;" v-loading="loading">
      <el-table-column prop="title" label="任务名称" min-width="200">
        <template #default="{ row }">
          <el-link type="primary" @click="goDetail(row.id)">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <TaskStatusTag :status="row.status" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="优先级" width="80">
        <template #default="{ row }">
          <TaskPriorityTag :priority="row.priority" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="负责人" width="100">
        <template #default="{ row }">
          {{ row.assignee_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.category" size="small" type="info">{{ row.category }}</el-tag>
          <span v-else style="color: #c0c4cc;">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止日期" width="120">
        <template #default="{ row }">
          <span :style="{ color: isOverdue(row) ? '#f56c6c' : '' }">
            {{ row.deadline || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status !== 'completed'" size="small" type="success" @click="handleStatusChange(row, 'completed')">完成</el-button>
          <el-button v-if="row.status === 'pending'" size="small" type="warning" @click="handleStatusChange(row, 'inProgress')">开始</el-button>
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该任务？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑弹窗 -->
    <el-dialog :title="editingTask ? '编辑任务' : '新建任务'" v-model="showDialog" width="550px" @close="resetForm">
      <TaskForm ref="taskFormRef" :initial-data="editingTask || {}" :personnel-list="personnelStore.personnel" :department-list="personnelStore.departmentTree" />
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useTaskStore } from '@/stores/task'
import { usePersonnelStore } from '@/stores/personnel'
import TaskForm from '@/components/task/TaskForm.vue'
import TaskStatusTag from '@/components/task/TaskStatusTag.vue'
import TaskPriorityTag from '@/components/task/TaskPriorityTag.vue'

const router = useRouter()
const taskStore = useTaskStore()
const personnelStore = usePersonnelStore()

const searchText = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const showDialog = ref(false)
const editingTask = ref(null)
const submitting = ref(false)
const taskFormRef = ref(null)
const loading = ref(false)

const filteredTasks = computed(() => {
  let list = taskStore.tasks
  if (searchText.value) {
    const text = searchText.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(text))
  }
  if (filterStatus.value) {
    list = list.filter(t => t.status === filterStatus.value)
  }
  if (filterPriority.value) {
    list = list.filter(t => t.priority === filterPriority.value)
  }
  return list
})

function isOverdue(task) {
  return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'
}

function goDetail(id) {
  router.push(`/task/${id}`)
}

async function handleStatusChange(task, newStatus) {
  try {
    await taskStore.changeTaskStatus(task.id, newStatus)
    const label = newStatus === 'completed' ? '已完成' : '进行中'
    ElMessage.success(`任务已标记为${label}`)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

function handleEdit(task) {
  editingTask.value = { ...task }
  showDialog.value = true
}

async function handleSubmit() {
  const valid = await taskFormRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    const data = taskFormRef.value.getData()

    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, data)
      ElMessage.success('任务已更新')
    } else {
      await taskStore.addTask(data)
      ElMessage.success('任务已创建')
    }

    showDialog.value = false
    resetForm()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  try {
    await taskStore.removeTask(id)
    ElMessage.success('任务已删除')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

function resetForm() {
  editingTask.value = null
}

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      personnelStore.fetchPersonnel(),
      personnelStore.fetchDepartmentTree()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})
</script>
