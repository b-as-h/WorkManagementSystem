/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const date = formatDate(dateStr)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${date} ${h}:${min}:${s}`
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const target = new Date(dateStr)
  const diff = now - target
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return formatDate(dateStr)
}

/**
 * 判断是否已逾期
 */
export function isOverdue(deadline) {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

/**
 * 获取距离截止日期的天数（负数表示已逾期）
 */
export function getDaysUntilDeadline(deadline) {
  if (!deadline) return null
  const now = new Date()
  const target = new Date(deadline)
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
