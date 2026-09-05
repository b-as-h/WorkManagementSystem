const crypto = require('crypto');

// 生成UUID
function generateId() {
  return crypto.randomUUID();
}

// 数字补零
function pad(num) {
  return String(num).padStart(2, '0');
}

// 格式化为本地日期时间 YYYY-MM-DD HH:mm:ss
// 注意：不能使用 toISOString()，它输出 UTC 时间，在中国时区会早 8 小时
function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 格式化为本地日期 YYYY-MM-DD
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

module.exports = {
  generateId,
  formatDateTime,
  formatDate,
  successResponse,
  errorResponse
};
