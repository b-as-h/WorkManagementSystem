<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
    <el-form-item label="任务名称" prop="title">
      <el-input v-model="form.title" placeholder="请输入任务名称" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
    </el-form-item>
    <el-form-item label="优先级" prop="priority">
      <el-radio-group v-model="form.priority">
        <el-radio-button value="high">高</el-radio-button>
        <el-radio-button value="medium">中</el-radio-button>
        <el-radio-button value="low">低</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="所属部门">
      <el-tree-select
        v-model="form.departmentId"
        :data="departmentList"
        :props="{ label: 'name', value: 'id', children: 'children' }"
        placeholder="请选择部门"
        check-strictly
        clearable
        style="width: 100%;"
      />
    </el-form-item>
    <el-form-item label="指派给">
      <el-select v-model="form.assigneeId" placeholder="选择负责人" clearable filterable style="width: 100%;">
        <el-option
          v-for="p in personnelList"
          :key="p.id"
          :label="p.name"
          :value="p.id"
        >
          <span>{{ p.name }}</span>
          <span style="color: #909399; margin-left: 8px; font-size: 12px;">{{ p.department_name }}</span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="分类标签">
      <el-input v-model="form.category" placeholder="如：Bug、需求、优化" />
    </el-form-item>
    <el-form-item label="截止日期">
      <el-date-picker v-model="form.deadline" type="date" placeholder="请选择截止日期" value-format="YYYY-MM-DD" style="width: 100%;" />
    </el-form-item>
  </el-form>
</template>

<script setup>
const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  personnelList: { type: Array, default: () => [] },
  departmentList: { type: Array, default: () => [] }
})

const formRef = ref(null)

function getDefaultForm() {
  return {
    title: '',
    description: '',
    priority: 'medium',
    departmentId: null,
    assigneeId: null,
    category: '',
    deadline: null
  }
}

const form = ref(getDefaultForm())

const rules = {
  title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
}

// 监听初始数据变化：编辑时回填，新建（无 id）时重置为空白表单
watch(() => props.initialData, (val) => {
  if (val && val.id) {
    form.value = {
      title: val.title || '',
      description: val.description || '',
      priority: val.priority || 'medium',
      departmentId: val.department_id || val.departmentId || null,
      assigneeId: val.assignee_id || val.assigneeId || null,
      category: val.category || '',
      deadline: val.deadline || null
    }
  } else {
    form.value = getDefaultForm()
  }
}, { immediate: true, deep: true })

async function validate() {
  return formRef.value.validate().catch(() => false)
}

function getData() {
  return {
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    departmentId: form.value.departmentId,
    assigneeId: form.value.assigneeId,
    category: form.value.category,
    deadline: form.value.deadline
  }
}

defineExpose({ validate, getData })
</script>
