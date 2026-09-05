const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/departments - 获取所有部门
router.get('/', async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT * FROM departments ORDER BY created_at'
    );
    res.json(successResponse(departments));
  } catch (error) {
    console.error('获取部门列表失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// GET /api/departments/tree - 获取部门树结构
router.get('/tree', async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments ORDER BY created_at');

    // 构建树结构
    const map = {};
    const roots = [];

    departments.forEach(dept => {
      map[dept.id] = { ...dept, children: [] };
    });

    departments.forEach(dept => {
      if (dept.parent_id && map[dept.parent_id]) {
        map[dept.parent_id].children.push(map[dept.id]);
      } else {
        roots.push(map[dept.id]);
      }
    });

    res.json(successResponse(roots));
  } catch (error) {
    console.error('获取部门树失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// GET /api/departments/:id - 获取单个部门
router.get('/:id', async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT * FROM departments WHERE id = ?',
      [req.params.id]
    );

    if (departments.length === 0) {
      return res.status(404).json(errorResponse('部门不存在', 404));
    }

    res.json(successResponse(departments[0]));
  } catch (error) {
    console.error('获取部门详情失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// POST /api/departments - 创建部门
router.post('/', async (req, res) => {
  try {
    const { name, parentId, description } = req.body;

    if (!name) {
      return res.status(400).json(errorResponse('部门名称不能为空'));
    }

    const id = 'dept-' + Date.now();

    await pool.query(
      'INSERT INTO departments (id, name, parent_id, description) VALUES (?, ?, ?, ?)',
      [id, name, parentId || null, description || '']
    );

    const [newDept] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);

    res.status(201).json(successResponse(newDept[0], '部门创建成功'));
  } catch (error) {
    console.error('创建部门失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// PUT /api/departments/:id - 更新部门
router.put('/:id', async (req, res) => {
  try {
    const { name, parentId, description } = req.body;
    const { id } = req.params;

    // 检查部门是否存在
    const [existing] = await pool.query('SELECT id FROM departments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(errorResponse('部门不存在', 404));
    }

    // 检查是否将部门设置为自己的子部门
    if (parentId === id) {
      return res.status(400).json(errorResponse('上级部门不能是自己'));
    }

    await pool.query(
      'UPDATE departments SET name = ?, parent_id = ?, description = ? WHERE id = ?',
      [name, parentId || null, description || '', id]
    );

    const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
    res.json(successResponse(updated[0], '部门更新成功'));
  } catch (error) {
    console.error('更新部门失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// DELETE /api/departments/:id - 删除部门
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有子部门
    const [children] = await pool.query(
      'SELECT id FROM departments WHERE parent_id = ?',
      [id]
    );

    if (children.length > 0) {
      return res.status(400).json(errorResponse('该部门下有子部门，无法删除'));
    }

    // 检查是否有人员
    const [personnel] = await pool.query(
      'SELECT id FROM personnel WHERE department_id = ?',
      [id]
    );

    if (personnel.length > 0) {
      return res.status(400).json(errorResponse('该部门下有人员，无法删除'));
    }

    await pool.query('DELETE FROM departments WHERE id = ?', [id]);

    res.json(successResponse(null, '部门删除成功'));
  } catch (error) {
    console.error('删除部门失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

module.exports = router;
