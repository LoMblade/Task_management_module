const { MongoClient } = require('mongodb');
const { randomUUID } = require('crypto');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('test');
  
  const items = await db.collection('nhan_vien').find({ id: { $exists: false } }).toArray();
  for (const item of items) {
    await db.collection('nhan_vien').updateOne({ _id: item._id }, { $set: { id: randomUUID() } });
    console.log('Fixed item', item._id);
  }
  
  client.close();
}

run();
