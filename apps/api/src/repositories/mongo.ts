import { MongoClient, type Collection } from 'mongodb';
import type { CongViecRepository, CongViecFilter, CongViecRecord } from '../domain.js';

export class MongoCongViecRepository implements CongViecRepository {
  constructor(private readonly collection: Collection<CongViecRecord>) {}

  static async create(uri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017', dbName = 'erp_long_do') {
    const client = new MongoClient(uri);
    await client.connect();
    const collection = client.db(dbName).collection<CongViecRecord>('cong_viec');
    await collection.createIndex({ congTyId: 1, deletedAt: 1, capNhatLuc: -1 });
    await collection.createIndex({ congTyId: 1, nguoiThucHienIds: 1, hetHan: 1 });
    await collection.createIndex({ congTyId: 1, duAnId: 1, trangThai: 1 });
    return new MongoCongViecRepository(collection);
  }

  async list(filter: CongViecFilter) {
    const query: Record<string, unknown> = { congTyId: filter.congTyId, deletedAt: { $exists: false } };
    if (filter.scope === 'CUA_TOI') query.nguoiThucHienIds = filter.userId;
    if (filter.scope === 'TOI_GIAO') query.nguoiGiaoId = filter.userId;
    if (filter.scope === 'THEO_DOI') query.nguoiTheoDoiIds = filter.userId;
    if (filter.scope === 'TAT_CA') query.$or = [{ nguoiGiaoId: filter.userId }, { nguoiThucHienIds: filter.userId }, { nguoiTheoDoiIds: filter.userId }];
    if (filter.duAnId) query.duAnId = filter.duAnId;
    if (filter.trangThai) query.trangThai = filter.trangThai;
    if (filter.uuTien) query.uuTien = filter.uuTien;
    if (filter.q) query.$or = [{ ma: { $regex: filter.q, $options: 'i' } }, { ten: { $regex: filter.q, $options: 'i' } }];
    const [items, total] = await Promise.all([
      this.collection.find(query).sort({ hetHan: 1 }).skip((filter.page - 1) * filter.limit).limit(filter.limit).toArray(),
      this.collection.countDocuments(query),
    ]);
    return { items, total };
  }

  async findById(congTyId: string, id: string) { return this.collection.findOne({ congTyId, id, deletedAt: { $exists: false } }); }
  async insert(input: CongViecRecord) { await this.collection.insertOne(input); return input; }
  async update(congTyId: string, id: string, patch: Partial<CongViecRecord>) { await this.collection.updateOne({ congTyId, id }, { $set: patch }); return (await this.findById(congTyId, id))!; }
  async nextMa(congTyId: string) { return `CV-${String(await this.collection.countDocuments({ congTyId }) + 1001).padStart(4, '0')}`; }
}
