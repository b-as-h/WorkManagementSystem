const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');

async function initDatabase() {
  let connection;
  let hasError = false;

  try {
    // 先连接到MySQL（不指定数据库）
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      multipleStatements: true
    });

    console.log('✅ 已连接到 MySQL 服务器');

    // 读取并执行SQL文件
    const sqlFile = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 执行SQL语句
    await connection.query(sql);

    console.log('✅ 数据库初始化成功！');
    console.log('   - 数据库 wms_db_other 已创建');
    console.log('   - 所有表已创建');
    console.log('   - 默认数据已插入');
    console.log('\n📋 默认管理员账号：');
    console.log('   用户名: admin');
    console.log('   密码: admin123');

  } catch (error) {
    hasError = true;
    console.error('❌ 数据库初始化失败:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 请确保 MySQL 服务已启动');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 请检查 config/database.js 中的数据库用户名和密码');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(hasError ? 1 : 0);
  }
}

initDatabase();
