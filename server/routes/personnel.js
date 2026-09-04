const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { successResponse, errorResponse, generateId, formatDate } = require('../utils/helpers');

// GET /api/personnel - 获取所有人员
router.get('/', async (req, res) => {
  try {
    const { department_id, status, search } = req.query;

    let sql = `
      SELECT p.*, d.name as department_name, r.name as role_name
      FROM personnel p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN roles r ON p.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      sql += ' AND p.department_id = ?';
      params.push(department_id);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.position LIKE ? OR p.phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY p.created_at DESC';

    const [personnel] = await pool.query(sql, params);

    // 格式化日期
    personnel.forEach(p => {
      if (p.entry_date) {
        p.entry_date = formatDate(p.entry_date);
      }
    });

    res.json(successResponse(personnel));
  } catch (error) {
    console.error('获取人员列表失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// GET /api/personnel/:id - 获取单个人员
router.get('/:id', async (req, res) => {
  try {
    const [personnel] = await pool.query(`
      SELECT p.*, d.name as department_name, r.name as role_name
      FROM personnel p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN roles r ON p.role_id = r.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (personnel.length === 0) {
      return res.status(404).json(errorResponse('人员不存在', 404));
    }

    const person = personnel[0];
    if (person.entry_date) {
      person.entry_date = formatDate(person.entry_date);
    }

    res.json(successResponse(person));
  } catch (error) {
    console.error('获取人员详情失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// POST /api/personnel - 创建人员
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, departmentId, roleId, position, entryDate } = req.body;

    if (!name) {
      return res.status(400).json(errorResponse('姓名不能为空'));
    }

    const id = generateId();

    await pool.query(
      `INSERT INTO personnel (id, name, phone, email, department_id, role_id, position, entry_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [id, name, phone || '', email || '', departmentId || null, roleId || 'role-member', position || '', entryDate || null]
    );

    // 获取创建的人员（包含关联信息）
    const [newPerson] = await pool.query(`
      SELECT p.*, d.name as department_name, r.name as role_name
      FROM personnel p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN roles r ON p.role_id = r.id
      WHERE p.id = ?
    `, [id]);

    const person = newPerson[0];
    if (person.entry_date) {
      person.entry_date = formatDate(person.entry_date);
    }

    res.status(201).json(successResponse(person, '人员创建成功'));
  } catch (error) {
    console.error('创建人员失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// PUT /api/personnel/:id - 更新人员
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, departmentId, roleId, position, entryDate, status } = req.body;
    const { id } = req.params;

    // 检查人员是否存在
    const [existing] = await pool.query('SELECT id FROM personnel WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(errorResponse('人员不存在', 404));
    }

    await pool.query(
      `UPDATE personnel SET
        name = ?, phone = ?, email = ?, department_id = ?,
        role_id = ?, position = ?, entry_date = ?, status = ?
       WHERE id = ?`,
      [
        name, phone || '', email || '', departmentId || null,
        roleId || null, position || '', entryDate || null,
        status || 'active', id
      ]
    );

    // 获取更新后的人员
    const [updated] = await pool.query(`
      SELECT p.*, d.name as department_name, r.name as role_name
      FROM personnel p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN roles r ON p.role_id = r.id
      WHERE p.id = ?
    `, [id]);

    const person = updated[0];
    if (person.entry_date) {
      person.entry_date = formatDate(person.entry_date);
    }

    res.json(successResponse(person, '人员更新成功'));
  } catch (error) {
    console.error('更新人员失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// DELETE /api/personnel/:id - 删除人员
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查人员是否存在
    const [existing] = await pool.query('SELECT id FROM personnel WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(errorResponse('人员不存在', 404));
    }

    // 删除关联的用户账号（如果有）
    await pool.query('DELETE FROM users WHERE personnel_id = ?', [id]);

    // 将该人员的任务设为未分配
    await pool.query('UPDATE tasks SET assignee_id = NULL WHERE assignee_id = ?', [id]);

    // 删除人员
    await pool.query('DELETE FROM personnel WHERE id = ?', [id]);

    res.json(successResponse(null, '人员删除成功'));
  } catch (error) {
    console.error('删除人员失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

module.exports = router;
