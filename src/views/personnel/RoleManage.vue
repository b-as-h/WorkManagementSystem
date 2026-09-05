<template>
  <div class="page-container">
    <div class="table-header">
      <h2>角色权限管理</h2>
      <el-button type="primary" @click="showDialog = true; editingRole = null;">
        <el-icon><Plus /></el-icon> 新增角色
      </el-button>
    </div>

    <el-table :data="personnelStore.roles" stripe v-loading="loading">
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="权限" min-width="300">
        <template #default="{ row }">
          <el-tag
            v-for="perm in row.permissions"
            :key="perm"
            size="small"
            style="margin: 2px 4px 2px 0;"
          >
            {{ getPermLabel(perm) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="使用人数" width="100">
        <template #default="{ row }">
          {{ getRolePersonnelCount(row.id) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该角色？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="editingRole ? '编辑角色' : '新增角色'" v-model="showDialog" width="500px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox
              v-for="perm in ALL_PERMISSIONS"
              :key="perm.key"
              :label="perm.key"
              :value="perm.key"
            >
              {{ perm.label }}
            </el-checkbox>
          </el-checkbox-group>
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
import { ALL_PERMISSIONS } from '@/utils/constants'

const personnelStore = usePersonnelStore()

const showDialog = ref(false)
const editingRole = ref(null)
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  name: '',
  description: '',
  permissions: []
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

function getPermLabel(key) {
  return ALL_PERMISSIONS.find(p => p.key === key)?.label || key
}

function getRolePersonnelCount(roleId) {
  return personnelStore.personnel.filter(p => p.role_id === roleId).length
}

function handleEdit(role) {
  editingRole.value = role
  form.value = { name: role.name, description: role.description || '', permissions: [...(role.permissions || [])] }
  showDialog.value = true
}

async function handleSubmit() {
  // 校验不通过时 validate() 会 reject，属预期分支：忽略异常仅返回 false
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingRole.value) {
      await personnelStore.updateRole(editingRole.value.id, { ...form.value })
      ElMessage.success('角色已更新')
    } else {
      await personnelStore.addRole({ ...form.value })
      ElMessage.success('角色已添加')
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
    const result = await personnelStore.removeRole(id)
    if (result.success) {
      ElMessage.success('角色已删除')
    } else {
      ElMessage.warning(result.message)
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

function resetForm() {
  editingRole.value = null
  form.value = { name: '', description: '', permissions: [] }
}

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      personnelStore.fetchRoles(),
      personnelStore.fetchPersonnel()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})
</script>
