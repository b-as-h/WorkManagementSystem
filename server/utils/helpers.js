const crypto = require('crypto');

// 生成UUID
function generateId() {
  return crypto.randomUUID();
}

// 格式化日期时间
function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// 格式化日期
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

// 统一响应格式
function successResponse(data, message = '操作成功') {
  return {
    code: 200,
    message,
    data
  };
}

function errorResponse(message = '操作失败', code = 400) {
  return {
    code,
    message,
    data: null
  };
}

// 分页参数处理
function getPagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

module.exports = {
  generateId,
  formatDateTime,
  formatDate,
  successResponse,
  errorResponse,
  getPagination
};
