const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { successResponse, errorResponse, generateId, formatDate, formatDateTime } = require('../utils/helpers');

// GET /api/tasks - 获取所有任务
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignee_id, department_id, search } = req.query;

    let sql = `
      SELECT t.*, p.name as assignee_name, d.name as department_name
      FROM tasks t
      LEFT JOIN personnel p ON t.assignee_id = p.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    if (assignee_id) {
      sql += ' AND t.assignee_id = ?';
      params.push(assignee_id);
    }

    if (department_id) {
      sql += ' AND t.department_id = ?';
      params.push(department_id);
    }

    if (search) {
      sql += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    sql += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.query(sql, params);

    // 格式化日期
    tasks.forEach(t => {
      if (t.deadline) t.deadline = formatDate(t.deadline);
      if (t.created_at) t.created_at = formatDateTime(t.created_at);
      if (t.updated_at) t.updated_at = formatDateTime(t.updated_at);
      if (t.completed_at) t.completed_at = formatDateTime(t.completed_at);
    });

    res.json(successResponse(tasks));
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// GET /api/tasks/statistics - 获取任务统计
router.get('/statistics', async (req, res) => {
  try {
    // 总任务数
    const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM tasks');
    const total = totalResult[0].total;

    // 按状态统计
    const [statusStats] = await pool.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM tasks
      GROUP BY status
    `);

    const byStatus = { pending: 0, inProgress: 0, completed: 0, overdue: 0 };
    statusStats.forEach(s => {
      if (byStatus[s.status] !== undefined) {
        byStatus[s.status] = s.count;
      }
    });

    // 统计逾期任务（未完成且超过截止日期）
    const [overdueResult] = await pool.query(`
      SELECT COUNT(*) as count FROM tasks
      WHERE status != 'completed' AND deadline < CURDATE() AND deadline IS NOT NULL
    `);
    byStatus.overdue = overdueResult[0].count;

    // 按优先级统计
    const [priorityStats] = await pool.query(`
      SELECT
        priority,
        COUNT(*) as count
      FROM tasks
      GROUP BY priority
    `);

    const byPriority = { high: 0, medium: 0, low: 0 };
    priorityStats.forEach(p => {
      if (byPriority[p.priority] !== undefined) {
        byPriority[p.priority] = p.count;
      }
    });

    res.json(successResponse({ total, byStatus, byPriority }));
  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// GET /api/tasks/:id - 获取单个任务
router.get('/:id', async (req, res) => {
  try {
    const [tasks] = await pool.query(`
      SELECT t.*, p.name as assignee_name, d.name as department_name
      FROM tasks t
      LEFT JOIN personnel p ON t.assignee_id = p.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (tasks.length === 0) {
      return res.status(404).json(errorResponse('任务不存在', 404));
    }

    const task = tasks[0];

    // 获取时间线
    const [timeline] = await pool.query(`
      SELECT * FROM task_timeline
      WHERE task_id = ?
      ORDER BY created_at DESC
    `, [task.id]);

    task.timeline = timeline.map(t => ({
      action: t.action,
      timestamp: formatDateTime(t.created_at),
      detail: t.detail
    }));

    // 格式化日期
    if (task.deadline) task.deadline = formatDate(task.deadline);
    if (task.created_at) task.created_at = formatDateTime(task.created_at);
    if (task.updated_at) task.updated_at = formatDateTime(task.updated_at);
    if (task.completed_at) task.completed_at = formatDateTime(task.completed_at);

    res.json(successResponse(task));
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// POST /api/tasks - 创建任务
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, category, assigneeId, departmentId, deadline } = req.body;

    if (!title) {
      return res.status(400).json(errorResponse('任务标题不能为空'));
    }

    const id = generateId();

    // 创建任务
    await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, category, assignee_id, department_id, deadline)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [id, title, description || '', priority || 'medium', category || '', assigneeId || null, departmentId || null, deadline || null]
    );

    // 添加时间线记录
    await pool.query(
      'INSERT INTO task_timeline (task_id, action, detail) VALUES (?, ?, ?)',
      [id, 'created', '任务创建']
    );

    // 获取创建的任务
    const [newTask] = await pool.query(`
      SELECT t.*, p.name as assignee_name, d.name as department_name
      FROM tasks t
      LEFT JOIN personnel p ON t.assignee_id = p.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE t.id = ?
    `, [id]);

    const task = newTask[0];
    task.timeline = [{ action: 'created', timestamp: formatDateTime(new Date()), detail: '任务创建' }];
    if (task.deadline) task.deadline = formatDate(task.deadline);
    if (task.created_at) task.created_at = formatDateTime(task.created_at);
    if (task.updated_at) task.updated_at = formatDateTime(task.updated_at);

    res.status(201).json(successResponse(task, '任务创建成功'));
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// PUT /api/tasks/:id - 更新任务
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, category, assigneeId, departmentId, deadline } = req.body;
    const { id } = req.params;

    // 检查任务是否存在
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(errorResponse('任务不存在', 404));
    }

    const oldTask = existing[0];
    const changedFields = [];

    // 检测变更字段
    if (title !== undefined && title !== oldTask.title) changedFields.push('title');
    if (description !== undefined && description !== oldTask.description) changedFields.push('description');
    if (status !== undefined && status !== oldTask.status) changedFields.push('status');
    if (priority !== undefined && priority !== oldTask.priority) changedFields.push('priority');
    if (category !== undefined && category !== oldTask.category) changedFields.push('category');
    if (assigneeId !== undefined && assigneeId !== oldTask.assignee_id) changedFields.push('assignee');
    if (departmentId !== undefined && departmentId !== oldTask.department_id) changedFields.push('department');
    if (deadline !== undefined && deadline !== formatDate(oldTask.deadline)) changedFields.push('deadline');

    // 更新任务
    const completedAt = (status === 'completed' && oldTask.status !== 'completed') ? new Date() : oldTask.completed_at;

    await pool.query(
      `UPDATE tasks SET
        title = ?, description = ?, status = ?, priority = ?,
        category = ?, assignee_id = ?, department_id = ?,
        deadline = ?, completed_at = ?
       WHERE id = ?`,
      [
        title || oldTask.title,
        description !== undefined ? description : oldTask.description,
        status || oldTask.status,
        priority || oldTask.priority,
        category !== undefined ? category : oldTask.category,
        assigneeId !== undefined ? assigneeId : oldTask.assignee_id,
        departmentId !== undefined ? departmentId : oldTask.department_id,
        deadline !== undefined ? deadline : oldTask.deadline,
        completedAt,
        id
      ]
    );

    // 添加时间线记录
    if (changedFields.length > 0) {
      await pool.query(
        'INSERT INTO task_timeline (task_id, action, detail) VALUES (?, ?, ?)',
        [id, 'updated', `更新字段: ${changedFields.join(', ')}`]
      );
    }

    // 获取更新后的任务
    const [updated] = await pool.query(`
      SELECT t.*, p.name as assignee_name, d.name as department_name
      FROM tasks t
      LEFT JOIN personnel p ON t.assignee_id = p.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE t.id = ?
    `, [id]);

    const task = updated[0];

    // 获取时间线
    const [timeline] = await pool.query(
      'SELECT * FROM task_timeline WHERE task_id = ? ORDER BY created_at DESC',
      [id]
    );

    task.timeline = timeline.map(t => ({
      action: t.action,
      timestamp: formatDateTime(t.created_at),
      detail: t.detail
    }));

    if (task.deadline) task.deadline = formatDate(task.deadline);
    if (task.created_at) task.created_at = formatDateTime(task.created_at);
    if (task.updated_at) task.updated_at = formatDateTime(task.updated_at);
    if (task.completed_at) task.completed_at = formatDateTime(task.completed_at);

    res.json(successResponse(task, '任务更新成功'));
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// PUT /api/tasks/:id/status - 更新任务状态
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !['pending', 'inProgress', 'completed'].includes(status)) {
      return res.status(400).json(errorResponse('无效的状态值'));
    }

    // 检查任务是否存在
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(errorResponse('任务不存在', 404));
    }

    const completedAt = status === 'completed' ? new Date() : null;

    await pool.query(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?',
      [status, completedAt, id]
    );

    // 添加时间线记录
    const statusLabels = { pending: '待处理', inProgress: '进行中', completed: '已完成' };
    await pool.query(
      'INSERT INTO task_timeline (task_id, action, detail) VALUES (?, ?, ?)',
      [id, 'status_change', `状态变更为: ${statusLabels[status]}`]
    );

    res.json(successResponse(null, '状态更新成功'));
  } catch (error) {
    console.error('更新任务状态失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// DELETE /api/tasks/:id - 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查任务是否存在
    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(errorResponse('任务不存在', 404));
    }

    // 删除任务（时间线会自动级联删除）
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    res.json(successResponse(null, '任务删除成功'));
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

module.exports = router;
