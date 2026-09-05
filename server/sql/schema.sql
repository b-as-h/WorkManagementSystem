-- 工作管理系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS wms_db_other DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wms_db_other;

-- 关闭外键检查，保证重复初始化时 DROP TABLE 不受外键约束影响
SET FOREIGN_KEY_CHECKS = 0;

-- 部门表
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL COMMENT '部门名称',
  `parent_id` varchar(36) DEFAULT NULL COMMENT '上级部门ID',
  `description` text COMMENT '部门描述',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 角色表
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `description` text COMMENT '角色描述',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 角色权限关联表
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `role_id` varchar(36) NOT NULL,
  `permission` varchar(50) NOT NULL COMMENT '权限标识',
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限表';

-- 用户表（用于登录）
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `username` varchar(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `name` varchar(50) NOT NULL COMMENT '显示名称',
  `personnel_id` varchar(36) DEFAULT NULL COMMENT '关联人员ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 人员表
DROP TABLE IF EXISTS `personnel`;
CREATE TABLE `personnel` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `name` varchar(50) NOT NULL COMMENT '姓名',
  `phone` varchar(20) DEFAULT '' COMMENT '手机号',
  `email` varchar(100) DEFAULT '' COMMENT '邮箱',
  `department_id` varchar(36) DEFAULT NULL COMMENT '部门ID',
  `role_id` varchar(36) DEFAULT NULL COMMENT '角色ID',
  `position` varchar(100) DEFAULT '' COMMENT '职位',
  `entry_date` date DEFAULT NULL COMMENT '入职日期',
  `status` enum('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员表';

-- 添加用户表外键
ALTER TABLE `users` ADD FOREIGN KEY (`personnel_id`) REFERENCES `personnel`(`id`) ON DELETE SET NULL;

-- 任务表
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `title` varchar(200) NOT NULL COMMENT '任务标题',
  `description` text COMMENT '任务描述',
  `status` enum('pending', 'inProgress', 'completed') DEFAULT 'pending' COMMENT '任务状态',
  `priority` enum('high', 'medium', 'low') DEFAULT 'medium' COMMENT '优先级',
  `category` varchar(50) DEFAULT '' COMMENT '分类',
  `assignee_id` varchar(36) DEFAULT NULL COMMENT '负责人ID',
  `department_id` varchar(36) DEFAULT NULL COMMENT '部门ID',
  `deadline` date DEFAULT NULL COMMENT '截止日期',
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间',
  `created_by` varchar(36) DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`assignee_id`) REFERENCES `personnel`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 任务时间线表
DROP TABLE IF EXISTS `task_timeline`;
CREATE TABLE `task_timeline` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `task_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL COMMENT '操作类型',
  `detail` text COMMENT '操作详情',
  `operator_id` varchar(36) DEFAULT NULL COMMENT '操作人ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务时间线表';

-- 插入默认部门数据
INSERT INTO `departments` (`id`, `name`, `parent_id`, `description`) VALUES
('dept-1', '技术部', NULL, '负责技术研发'),
('dept-2', '产品部', NULL, '负责产品设计与规划'),
('dept-3', '设计部', NULL, '负责UI/UX设计'),
('dept-4', '市场部', NULL, '负责市场推广'),
('dept-1-1', '前端组', 'dept-1', '前端开发'),
('dept-1-2', '后端组', 'dept-1', '后端开发');

-- 插入默认角色数据
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
('role-admin', '管理员', '系统管理员，拥有所有权限'),
('role-manager', '部门经理', '管理部门和任务'),
('role-member', '普通成员', '查看和更新自己的任务');

-- 插入角色权限
INSERT INTO `role_permissions` (`role_id`, `permission`) VALUES
('role-admin', 'all'),
('role-manager', 'task.assign'),
('role-manager', 'task.view'),
('role-manager', 'task.manage'),
('role-manager', 'personnel.view'),
('role-member', 'task.view'),
('role-member', 'task.updateOwn');

-- 插入默认管理员用户 (密码: admin123，bcrypt 哈希存储)
INSERT INTO `users` (`id`, `username`, `password`, `name`) VALUES
('user-admin', 'admin', '$2a$10$zu9qXeSqsU3VJMQAo7fFsO2gy/XA48UYdBK6K90eQBpyvFF/glRyi', '系统管理员');

-- 重新开启外键检查
SET FOREIGN_KEY_CHECKS = 1;
