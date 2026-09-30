const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('test');
  
  // Xem t?t c? tasks và ai là ngý?i giao
  const tasks = await db.collection('cong_viec').find({ deletedAt: { $exists: false } }).project({ id: 1, ten: 1, nguoiGiaoId: 1, trangThai: 1, deletedAt: 1 }).toArray();
  console.log('=== T?T C? CÔNG VI?C (chýa xóa) ===');
  tasks.forEach(t => console.log(JSON.stringify({ id: t.id, ten: t.ten, nguoiGiaoId: t.nguoiGiaoId, trangThai: t.trangThai })));
  
  // Xem tasks ð? b? xóa m?m
  const deleted = await db.collection('cong_viec').find({ deletedAt: { $exists: true } }).project({ id: 1, ten: 1, deletedAt: 1 }).toArray();
  console.log('\n=== CÔNG VI?C Ð? XÓA M?M ===');
  deleted.forEach(t => console.log(JSON.stringify(t)));
  
  await client.close();
}
run();
