import { Collection, Db, Filter, ObjectId } from 'mongodb';
import { CongViec, LichSuThayDoi, ViecCon, BinhLuan, NhanVien, DuAn } from '@erp/contracts';
import { CongViecRepository, CongViecFilter, ScopeCounts, LichSuRepository, ViecConRepository, BinhLuanRepository, DanhMucRepository } from '../domain';

function cleanUndefined(obj: any) {
  const result = { ...obj };
  Object.keys(result).forEach(key => result[key] === undefined && delete result[key]);
  return result;
}

export class MongoCongViecRepository implements CongViecRepository {
  private col: Collection<CongViec>;
  private db: Db;

  constructor(db: Db) {
    this.col = db.collection<CongViec>('cong_viec');
    this.db = db;
  }

  async setupIndexes() {
    await this.col.createIndex({ congTyId: 1, deletedAt: 1, nguoiGiaoId: 1 });
    await this.col.createIndex({ congTyId: 1, deletedAt: 1, nguoiThucHienIds: 1 });
    await this.col.createIndex({ congTyId: 1, deletedAt: 1, nguoiTheoDoiIds: 1 });
    await this.col.createIndex({ congTyId: 1, ma: 1 }, { unique: true });
    await this.col.createIndex({ congTyId: 1, hetHan: 1 });
    // Text search index
    await this.col.createIndex({ ten: 'text', ma: 'text' });
  }

  private buildVisibilityFilter(filter: CongViecFilter): Filter<CongViec> {
    const base: Filter<CongViec> = { congTyId: filter.congTyId, deletedAt: { $exists: false } };
    
    // Nếu là Giám đốc / Admin thì có quyền xem toàn bộ công việc trong công ty
    if (!filter.isAdmin) {
      base.$or = [
        { nguoiGiaoId: filter.userId },
        { nguoiThucHienIds: filter.userId },
        { nguoiTheoDoiIds: filter.userId }
      ];
    }
    
    return base;
  }

  async list(filter: CongViecFilter): Promise<{ items: CongViec[]; total: number; counts: ScopeCounts }> {
    const baseFilter = this.buildVisibilityFilter(filter);
    
    // Counts
    const cuaToi = await this.col.countDocuments({ ...baseFilter, nguoiThucHienIds: filter.userId });
    const toiGiao = await this.col.countDocuments({ ...baseFilter, nguoiGiaoId: filter.userId });
    const theoDoi = await this.col.countDocuments({ ...baseFilter, nguoiTheoDoiIds: filter.userId });
    const tatCa = await this.col.countDocuments(baseFilter);

    // Specific Scope Filter
    const query: Filter<CongViec> = { ...baseFilter };
    if (filter.scope === 'CUA_TOI') query.nguoiThucHienIds = filter.userId;
    if (filter.scope === 'TOI_GIAO') query.nguoiGiaoId = filter.userId;
    if (filter.scope === 'THEO_DOI') query.nguoiTheoDoiIds = filter.userId;

    if (filter.duAnId === 'viec-chung') query.duAnId = { $exists: false };
    else if (filter.duAnId) query.duAnId = filter.duAnId;

    if (filter.trangThai) query.trangThai = filter.trangThai as any;
    if (filter.uuTien) query.uuTien = filter.uuTien as any;
    
    if (filter.quaHan) {
      query.trangThai = { $ne: 'HOAN_THANH' };
      query.hetHan = { $lt: filter.today };
    }

    if (filter.q) {
      query.$text = { $search: filter.q };
    }

    const sortOptions: any = {};
    if (filter.sort === 'hetHan') sortOptions.hetHan = 1;
    else if (filter.sort === '-hetHan') sortOptions.hetHan = -1;
    else if (filter.sort === 'capNhatLuc') sortOptions.capNhatLuc = 1;
    else if (filter.sort === '-capNhatLuc') sortOptions.capNhatLuc = -1;
    else sortOptions.taoLuc = -1;

    const skip = (filter.page - 1) * filter.limit;
    
    const items = await this.col.find(query).sort(sortOptions).skip(skip).limit(filter.limit).toArray();
    const total = await this.col.countDocuments(query);

    return {
      items,
      total,
      counts: { cuaToi, toiGiao, theoDoi, tatCa }
    };
  }

  async findById(congTyId: string, id: string): Promise<CongViec | null> {
    return this.col.findOne({ id, congTyId, deletedAt: { $exists: false } });
  }

  async insert(task: CongViec): Promise<CongViec> {
    await this.col.insertOne(cleanUndefined(task) as any);
    return task;
  }

  async update(congTyId: string, id: string, patch: Partial<CongViec>): Promise<CongViec> {
    await this.col.updateOne({ id, congTyId }, { $set: cleanUndefined(patch) });
    // Dùng findOne trực tiếp thay vì findById vì findById lọc deletedAt
    // Khi softDelete set deletedAt, findById sẽ trả null → crash
    return this.col.findOne({ id, congTyId }) as Promise<CongViec>;
  }

  async nextMa(congTyId: string): Promise<string> {
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: congTyId as any },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    ) as any;
    // mongodb v6 returns the document directly. Older versions return { value: doc }
    const doc = counter && 'value' in counter ? counter.value : counter;
    const num = 1000 + (doc?.seq || 1);
    return `CV-${num}`;
  }
}

export class MongoLichSuRepository implements LichSuRepository {
  private col: Collection<LichSuThayDoi>;
  constructor(db: Db) { this.col = db.collection<LichSuThayDoi>('lich_su'); }
  async setupIndexes() { await this.col.createIndex({ congViecId: 1, taoLuc: -1 }); }
  async insert(entry: LichSuThayDoi) { await this.col.insertOne(cleanUndefined(entry) as any); return entry; }
  async insertMany(entries: LichSuThayDoi[]) { if(entries.length) await this.col.insertMany(entries.map(cleanUndefined) as any); }
  async findByCongViec(congViecId: string) { return this.col.find({ congViecId }).sort({ taoLuc: -1 }).toArray(); }
}

export class MongoViecConRepository implements ViecConRepository {
  private col: Collection<ViecCon>;
  constructor(db: Db) { this.col = db.collection<ViecCon>('viec_con'); }
  async setupIndexes() { await this.col.createIndex({ congViecId: 1, thuTu: 1 }); }
  async findByCongViec(congViecId: string) { return this.col.find({ congViecId }).sort({ thuTu: 1 }).toArray(); }
  async insert(item: ViecCon) { await this.col.insertOne(cleanUndefined(item) as any); return item; }
  async update(congViecId: string, id: string, patch: Partial<ViecCon>) { 
    await this.col.updateOne({ id, congViecId }, { $set: cleanUndefined(patch) });
    return this.col.findOne({ id }) as Promise<ViecCon>;
  }
  async delete(congViecId: string, id: string) { await this.col.deleteOne({ id, congViecId }); }
  async countCompleted(congViecId: string) {
    const total = await this.col.countDocuments({ congViecId });
    const completed = await this.col.countDocuments({ congViecId, hoanThanh: true });
    return { total, completed };
  }
}

export class MongoBinhLuanRepository implements BinhLuanRepository {
  private col: Collection<BinhLuan>;
  constructor(db: Db) { this.col = db.collection<BinhLuan>('binh_luan'); }
  async setupIndexes() { await this.col.createIndex({ congViecId: 1, taoLuc: -1 }); }
  async findByCongViec(congViecId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const items = await this.col.find({ congViecId }).sort({ taoLuc: -1 }).skip(skip).limit(limit).toArray();
    const total = await this.col.countDocuments({ congViecId });
    return { items, total };
  }
  async insert(item: BinhLuan) { await this.col.insertOne(cleanUndefined(item) as any); return item; }
}

export class MongoDanhMucRepository implements DanhMucRepository {
  private nvCol: Collection<NhanVien>;
  private daCol: Collection<DuAn>;
  constructor(db: Db) {
    this.nvCol = db.collection<NhanVien>('nhan_vien');
    this.daCol = db.collection<DuAn>('du_an');
  }
  async setupIndexes() {
    await this.nvCol.createIndex({ congTyId: 1 });
    await this.daCol.createIndex({ congTyId: 1 });
  }
  async listNhanVien(congTyId: string) { return this.nvCol.find({ congTyId }).toArray(); }
  async insertNhanVien(item: NhanVien) { await this.nvCol.insertOne(cleanUndefined(item) as any); }
  async updateNhanVien(congTyId: string, id: string, patch: Partial<NhanVien>) {
    let filter: any = { congTyId, id };
    try {
      if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        filter = { congTyId, $or: [{ id }, { _id: new ObjectId(id) }] };
      }
    } catch (e) {
      console.error("updateNhanVien error:", e);
    }
    await this.nvCol.updateOne(filter, { $set: cleanUndefined(patch) });
    return this.nvCol.findOne(filter) as Promise<NhanVien>;
  }
  async deleteNhanVien(congTyId: string, id: string) {
    let filter: any = { congTyId, id };
    try {
      if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        filter = { congTyId, $or: [{ id }, { _id: new ObjectId(id) }] };
      }
    } catch (e) {
      console.error("deleteNhanVien error:", e);
    }
    await this.nvCol.deleteOne(filter);
  }
  async listDuAn(congTyId: string) { return this.daCol.find({ congTyId }).toArray(); }
  async insertDuAn(item: DuAn) { await this.daCol.insertOne(cleanUndefined(item) as any); }
}
