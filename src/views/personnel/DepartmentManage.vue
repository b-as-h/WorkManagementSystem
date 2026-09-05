<template>
  <div class="page-container">
    <div class="table-header">
      <h2>部门管理</h2>
      <el-button type="primary" @click="showDialog = true; editingDept = null;">
        <el-icon><Plus /></el-icon> 新增部门
      </el-button>
    </div>

    <el-card v-loading="loading">
      <el-tree
        :data="personnelStore.departmentTree"
        node-key="id"
        default-expand-all
        :props="{ label: 'name', children: 'children' }"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <span>{{ node.label }}</span>
            <span class="tree-actions">
              <el-tag size="small" type="info" style="margin-right: 8px;">
                {{ getDeptPersonnelCount(data.id) }}人
              </el-tag>
              <el-button size="small" text type="primary" @click.stop="handleAddChild(data)">添加子部门</el-button>
              <el-button size="small" text type="primary" @click.stop="handleEdit(data)">编辑</el-button>
              <el-popconfirm title="确定删除该部门？" @confirm="handleDelete(data.id)">
                <template #reference>
                  <el-button size="small" text type="danger" @click.stop>删除</el-button>
                </template>
              </el-popconfirm>
            </span>
          </div>
        </template>
      </el-tree>
      <el-empty v-if="!personnelStore.departments.length && !loading" description="暂无部门数据" />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="editingDept ? '编辑部门' : '新增部门'" v-model="showDialog" width="450px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="form.parentId"
            :data="personnelStore.departmentTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="无（顶级部门）"
            check-strictly
            clearable
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入部门描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { usePersonnelStore } from '@/stores/personnel'

const personnelStore = usePersonnelStore()

const showDialog = ref(false)
const editingDept = ref(null)
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  name: '',
  parentId: null,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

function getDeptPersonnelCount(deptId) {
  return personnelStore.personnel.filter(p => p.department_id === deptId).length
}

function handleAddChild(parentData) {
  editingDept.value = null
  form.value = { name: '', parentId: parentData.id, description: '' }
  showDialog.value = true
}

function handleEdit(data) {
  editingDept.value = data
  form.value = { name: data.name, parentId: data.parent_id, description: data.description || '' }
  showDialog.value = true
}

async function handleSubmit() {
  // 校验不通过时 validate() 会 reject，属预期分支：忽略异常仅返回 false
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingDept.value) {
      await personnelStore.updateDepartment(editingDept.value.id, { ...form.value })
      ElMessage.success('部门已更新')
    } else {
      await personnelStore.addDepartment({ ...form.value })
      ElMessage.success('部门已添加')
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
    const result = await personnelStore.removeDepartment(id)
    if (result.success) {
      ElMessage.success('部门已删除')
    } else {
      ElMessage.warning(result.message)
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

function resetForm() {
  editingDept.value = null
  form.value = { name: '', parentId: null, description: '' }
}

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      personnelStore.fetchDepartmentTree(),
      personnelStore.fetchDepartments(),
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
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}
.tree-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
