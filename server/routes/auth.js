const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { pool } = require('../config/database');
const { successResponse, errorResponse, generateId } = require('../utils/helpers');
const { generateToken } = require('../middleware/auth');

// 校验密码：支持 bcrypt 哈希，兼容历史明文密码
async function verifyPassword(inputPassword, storedPassword) {
  if (storedPassword.startsWith('$2')) {
    return bcrypt.compare(inputPassword, storedPassword);
  }
  return inputPassword === storedPassword;
}

// POST /api/auth/login - 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(errorResponse('用户名和密码不能为空'));
    }

    const [users] = await pool.query(
      'SELECT u.*, p.name as person_name, p.department_id, p.role_id FROM users u LEFT JOIN personnel p ON u.personnel_id = p.id WHERE u.username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json(errorResponse('用户名或密码错误', 401));
    }

    const user = users[0];

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return res.status(401).json(errorResponse('用户名或密码错误', 401));
    }

    // 获取角色信息
    let roleName = '普通用户';
    if (user.role_id) {
      const [roles] = await pool.query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
      if (roles.length > 0) {
        roleName = roles[0].name;
      }
    }

    const userData = {
      id: user.id,
      username: user.username,
      name: user.person_name || user.name,
      avatar: '',
      role: roleName,
      personnelId: user.personnel_id,
      departmentId: user.department_id,
      token: generateToken({ id: user.id, username: user.username })
    };

    res.json(successResponse(userData, '登录成功'));
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

// POST /api/auth/register - 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json(errorResponse('用户名、密码和姓名不能为空'));
    }

    // 检查用户名是否已存在
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json(errorResponse('用户名已存在'));
    }

    const userId = generateId();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (id, username, password, name) VALUES (?, ?, ?, ?)',
      [userId, username, hashedPassword, name]
    );

    const userData = {
      id: userId,
      username,
      name,
      avatar: '',
      role: '普通成员',
      token: generateToken({ id: userId, username })
    };

    res.status(201).json(successResponse(userData, '注册成功'));
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json(errorResponse('服务器内部错误', 500));
  }
});

module.exports = router;
