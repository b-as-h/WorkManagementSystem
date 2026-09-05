const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// GET /api/roles - 获取所有角色
router.get('/', async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY created_at');

    // 获取每个角色的权限
    for (let role of roles) {
      const [permissions] = await pool.query(
        'SELECT permission FROM role_permissions WHERE role_id = ?',
        [role.id]
      );
      role.permissions = permissions.map(p => p.permission);
    }

    res.json(successResponse(roles));
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// GET /api/roles/:id - 获取单个角色
router.get('/:id', async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles WHERE id = ?', [req.params.id]);

    if (roles.length === 0) {
      return res.status(404).json(errorResponse('角色不存在', 404));
    }

    const role = roles[0];

    // 获取权限
    const [permissions] = await pool.query(
      'SELECT permission FROM role_permissions WHERE role_id = ?',
      [role.id]
    );
    role.permissions = permissions.map(p => p.permission);

    res.json(successResponse(role));
  } catch (error) {
    console.error('获取角色详情失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// POST /api/roles - 创建角色
router.post('/', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json(errorResponse('角色名称不能为空'));
    }

    const id = 'role-' + Date.now();

    // 创建角色
    await pool.query(
      'INSERT INTO roles (id, name, description) VALUES (?, ?, ?)',
      [id, name, description || '']
    );

    // 添加权限
    if (permissions && permissions.length > 0) {
      const values = permissions.map(perm => [id, perm]);
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission) VALUES ?',
        [values]
      );
    }

    // 返回创建的角色
    const [newRole] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
    const [perms] = await pool.query(
      'SELECT permission FROM role_permissions WHERE role_id = ?',
      [id]
    );
    newRole[0].permissions = perms.map(p => p.permission);

    res.status(201).json(successResponse(newRole[0], '角色创建成功'));
  } catch (error) {
    console.error('创建角色失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// PUT /api/roles/:id - 更新角色
router.put('/:id', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const { id } = req.params;

    // 检查角色是否存在
    const [existing] = await pool.query('SELECT id FROM roles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json(errorResponse('角色不存在', 404));
    }

    // 更新角色信息
    await pool.query(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [name, description || '', id]
    );

    // 更新权限（先删除旧权限，再添加新权限）
    if (permissions !== undefined) {
      await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [id]);

      if (permissions && permissions.length > 0) {
        const values = permissions.map(perm => [id, perm]);
        await pool.query(
          'INSERT INTO role_permissions (role_id, permission) VALUES ?',
          [values]
        );
      }
    }

    // 返回更新后的角色
    const [updated] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
    const [perms] = await pool.query(
      'SELECT permission FROM role_permissions WHERE role_id = ?',
      [id]
    );
    updated[0].permissions = perms.map(p => p.permission);

    res.json(successResponse(updated[0], '角色更新成功'));
  } catch (error) {
    console.error('更新角色失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// DELETE /api/roles/:id - 删除角色
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查是否有人员使用该角色
    const [personnel] = await pool.query(
      'SELECT id FROM personnel WHERE role_id = ?',
      [id]
    );

    if (personnel.length > 0) {
      return res.status(400).json(errorResponse('该角色正在使用中，无法删除'));
    }

    // 删除角色（权限会自动级联删除）
    await pool.query('DELETE FROM roles WHERE id = ?', [id]);

    res.json(successResponse(null, '角色删除成功'));
  } catch (error) {
    console.error('删除角色失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

module.exports = router;
