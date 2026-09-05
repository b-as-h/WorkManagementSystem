# 工作管理系统 (Work Management System)

一个基于 Vue 3 + Express + MySQL 的全栈工作管理系统。

---

## 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 核心框架（Composition API） |
| Vite | ^8.0 | 构建工具 |
| Element Plus | ^2.14 | UI 组件库 |
| Pinia | ^3.0 | 状态管理 |
| Vue Router | ^4.6 | 路由管理 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 16.x | 运行环境 |
| Express | ^4.18 | Web 框架 |
| MySQL2 | ^3.9 | 数据库驱动 |
| Cors | ^2.8 | 跨域处理 |

---

## 功能概览

### 任务管理子系统

- **任务 CRUD**：创建、编辑、删除任务
- **状态流转**：待处理 → 进行中 → 已完成（支持重新打开）
- **优先级管理**：高 / 中 / 低三级优先级
- **分类标签**：自定义分类（如 Bug、需求、优化）
- **人员指派**：从人员库中选择负责人
- **截止日期**：设置截止时间，自动识别逾期任务
- **操作时间线**：记录每次状态变更和编辑操作
- **统计分析**：按状态、优先级、人员维度的可视化统计

### 人员管理子系统

- **人员档案**：姓名、职位、手机、邮箱、入职日期等
- **部门管理**：支持多级部门树形结构，可增删改
- **角色权限**：管理员 / 部门经理 / 普通成员，可自定义权限
- **人员筛选**：按部门筛选、按姓名/职位搜索
- **关联查看**：查看某人名下的所有任务

### 仪表盘

- 任务统计卡片（总数、进行中、已完成、逾期）
- 待办任务列表
- 人员/部门概览
- 快速操作入口

---

## 项目结构

```
WorkManagementSystem/
├── index.html                          # 前端入口
├── package.json                        # 前端依赖
├── vite.config.js                      # Vite 配置
│
├── src/                                # 前端源码
│   ├── main.js                         # 应用入口
│   ├── App.vue                         # 根组件
│   ├── router/                         # 路由配置
│   ├── stores/                         # Pinia 状态管理
│   ├── services/                       # API 服务层（新增）
│   ├── components/                     # 通用组件
│   ├── views/                          # 页面组件
│   ├── layouts/                        # 布局组件
│   ├── composables/                    # 组合式函数
│   ├── utils/                          # 工具函数
│   └── assets/                         # 静态资源
│
└── server/                             # 后端源码（新增）
    ├── app.js                          # Express 服务器入口
    ├── package.json                    # 后端依赖
    ├── .env                            # 环境变量配置
    ├── config/
    │   └── database.js                 # 数据库连接配置
    ├── routes/
    │   ├── auth.js                     # 认证接口
    │   ├── tasks.js                    # 任务接口
    │   ├── personnel.js                # 人员接口
    │   ├── departments.js              # 部门接口
    │   └── roles.js                    # 角色接口
    ├── sql/
    │   ├── schema.sql                  # 数据库表结构
    │   └── init.js                     # 数据库初始化脚本
    └── utils/
        └── helpers.js                  # 工具函数
```

---

## 快速开始

### 前置条件

1. **Node.js** >= 16.x
2. **MySQL** >= 5.7 或 8.x

### 第一步：配置数据库

1. 确保 MySQL 服务已启动

2. 修改数据库配置（可选）：

   编辑 `server/.env` 文件：
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=123456    # 修改为你的MySQL密码
   DB_NAME=wms_db_other
   PORT=3001
   ```

3. 初始化数据库：
   ```bash
   cd server
   npm install
   npm run init-db
   ```

   成功后会显示：
   ```
   ✅ 已连接到 MySQL 服务器
   ✅ 数据库初始化成功！
      - 数据库 wms_db_other 已创建
      - 所有表已创建
      - 默认数据已插入

   📋 默认管理员账号：
      用户名: admin
      密码: admin123
   ```

### 第二步：启动后端服务

```bash
cd server
npm run dev
```

成功后会显示：
```
🚀 工作管理系统后端服务已启动
   地址: http://localhost:3001
   API:  http://localhost:3001/api
```

### 第三步：启动前端服务

在新的终端窗口中：

```bash
# 回到项目根目录
npm install
npm run dev
```

成功后访问：`http://localhost:5173`

---

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |

---

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录页 | 用户名密码登录 |
| `/dashboard` | 仪表盘 | 统计概览 + 待办任务 |
| `/task` | 任务列表 | 任务 CRUD + 筛选搜索 |
| `/task/:id` | 任务详情 | 任务信息 + 状态流转 + 时间线 |
| `/task/statistics` | 任务统计 | 按状态/优先级/人员统计 |
| `/personnel` | 人员列表 | 人员 CRUD + 部门筛选 |
| `/personnel/:id` | 人员详情 | 人员档案 + 关联任务 |
| `/personnel/department` | 部门管理 | 树形部门 CRUD |
| `/personnel/role` | 角色权限 | 角色 + 权限配置 |

---

## API 接口

### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |

### 任务接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 获取任务列表（支持筛选） |
| GET | /api/tasks/statistics | 获取任务统计 |
| GET | /api/tasks/:id | 获取任务详情 |
| POST | /api/tasks | 创建任务 |
| PUT | /api/tasks/:id | 更新任务 |
| PUT | /api/tasks/:id/status | 更新任务状态 |
| DELETE | /api/tasks/:id | 删除任务 |

### 人员接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/personnel | 获取人员列表（支持搜索筛选） |
| GET | /api/personnel/:id | 获取人员详情 |
| POST | /api/personnel | 创建人员 |
| PUT | /api/personnel/:id | 更新人员 |
| DELETE | /api/personnel/:id | 删除人员 |

### 部门接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/departments | 获取部门列表 |
| GET | /api/departments/tree | 获取部门树结构 |
| GET | /api/departments/:id | 获取部门详情 |
| POST | /api/departments | 创建部门 |
| PUT | /api/departments/:id | 更新部门 |
| DELETE | /api/departments/:id | 删除部门 |

### 角色接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/roles | 获取角色列表 |
| GET | /api/roles/:id | 获取角色详情 |
| POST | /api/roles | 创建角色 |
| PUT | /api/roles/:id | 更新角色 |
| DELETE | /api/roles/:id | 删除角色 |

---

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户表（登录账号） |
| `personnel` | 人员表 |
| `departments` | 部门表（支持层级） |
| `roles` | 角色表 |
| `role_permissions` | 角色权限关联表 |
| `tasks` | 任务表 |
| `task_timeline` | 任务时间线表 |

---

## 权限模型

系统预设三种角色：

| 角色 | 权限 |
|------|------|
| 管理员 | 全部权限 |
| 部门经理 | 分配任务、查看任务、管理任务、查看人员 |
| 普通成员 | 查看任务、更新自己的任务 |

权限可在「角色权限」页面自定义扩展。

---

## 常见问题

### 1. 数据库连接失败
- 检查 MySQL 服务是否启动
- 检查 `server/.env` 中的数据库配置是否正确
- 确认密码是否正确

### 2. 前端无法访问后端API
- 确保后端服务已启动（http://localhost:3001）
- 检查浏览器控制台是否有跨域错误

### 3. 如何重新初始化数据库
```bash
cd server
npm run init-db
```
**注意：这会清空所有数据！**
#龙龙是BASH JL子