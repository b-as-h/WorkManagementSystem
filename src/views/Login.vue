<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>工作管理系统</h2>
          <p>Work Management System</p>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tip">
        <el-text type="info" size="small">默认账号：admin / admin123</el-text>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()
const formRef = ref(null)
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  // 校验不通过时 validate() 会 reject，属预期分支：忽略异常仅返回 false
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const result = await appStore.login(form.value.username, form.value.password)
    if (result.success) {
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    // store 已兜底业务错误（返回 success=false），此处仅捕获网络中断等未预期异常，记录日志便于排查
    console.error('登录异常:', error)
    ElMessage.error('登录失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  border-radius: 12px;
}

.login-header {
  text-align: center;
}

.login-header h2 {
  color: #303133;
  margin-bottom: 4px;
}

.login-header p {
  color: #909399;
  font-size: 13px;
}

.login-tip {
  text-align: center;
  margin-top: -8px;
}
</style>
