const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/helpers');

// JWT 密钥（练习项目，直接写死）
const JWT_SECRET = 'wms_dev_secret_change_in_production';
const JWT_EXPIRES_IN = '7d';

// 签发 token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 鉴权中间件：校验 Authorization: Bearer <token>
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json(errorResponse('未登录，请先登录', 401));
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('登录已过期，请重新登录', 401));
  }
}

module.exports = { authMiddleware, generateToken };
