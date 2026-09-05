const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { testConnection } = require('./config/database');
const { authMiddleware } = require('./middleware/auth');

// 导入路由
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const roleRoutes = require('./routes/roles');
const personnelRoutes = require('./routes/personnel');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// API 路由（登录注册、健康检查无需鉴权，其余接口需要登录）
app.use('/api/auth', authRoutes);
app.use('/api/departments', authMiddleware, departmentRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);
app.use('/api/personnel', authMiddleware, personnelRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use('/api/*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
});

// 启动服务器
async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('\n❌ 无法连接到数据库，请检查配置：');
    console.error('   1. 确保 MySQL 服务已启动');
    console.error('   2. 检查 server/.env 文件中的数据库配置');
    console.error('   3. 运行 npm run init-db 初始化数据库\n');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 工作管理系统后端服务已启动`);
    console.log(`   地址: http://localhost:${PORT}`);
    console.log(`   API:  http://localhost:${PORT}/api\n`);
  });
}

startServer();

module.exports = app;
