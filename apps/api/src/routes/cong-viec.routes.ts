import { FastifyInstance } from 'fastify';
import { CongViecService } from '../services/cong-viec.service';
import { AuthContext, DomainError } from '../domain';
import { 
  taoCongViecSchema, 
  capNhatCongViecSchema, 
  chuyenTrangThaiSchema, 
  congViecQuerySchema, 
  taoViecConSchema, 
  capNhatViecConSchema, 
  taoBinhLuanSchema 
} from '@erp/contracts';

function parseAuth(req: any): AuthContext {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) throw new DomainError('UNAUTHORIZED', 'Missing token', 401);
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
    return { userId: decoded.userId, congTyId: decoded.congTyId, isAdmin: decoded.isAdmin };
  } catch {
    throw new DomainError('UNAUTHORIZED', 'Invalid token', 401);
  }
}

export default async function (fastify: FastifyInstance, opts: { service: CongViecService; danhMucRepo: any }) {
  const { service, danhMucRepo } = opts;

  fastify.get('/api/nhan-vien', async (request) => {
    const ctx = parseAuth(request);
    return { data: await danhMucRepo.listNhanVien(ctx.congTyId) };
  });

  fastify.get('/api/du-an', async (request) => {
    const ctx = parseAuth(request);
    return { data: await danhMucRepo.listDuAn(ctx.congTyId) };
  });

  fastify.post('/api/cong-viec', async (request, reply) => {
    const ctx = parseAuth(request);
    const body = taoCongViecSchema.parse(request.body);
    const data = await service.create(ctx, body);
    reply.status(201).send({ data });
  });

  fastify.get('/api/cong-viec', async (request) => {
    const ctx = parseAuth(request);
    const query = congViecQuerySchema.parse(request.query);
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    const scope = query.scope || 'TAT_CA';
    const sort = query.sort || 'hetHan';
    const result = await service.list(ctx, { ...query, page, limit, scope, sort });
    return { data: result.items, meta: { page, limit, total: result.total }, counts: result.counts };
  });

  fastify.get('/api/cong-viec/:id', async (request) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    return { data: await service.get(ctx, id) };
  });

  fastify.patch('/api/cong-viec/:id', async (request) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    const body = capNhatCongViecSchema.parse(request.body);
    return { data: await service.update(ctx, id, body) };
  });

  fastify.post('/api/cong-viec/:id/trang-thai', async (request) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    const body = chuyenTrangThaiSchema.parse(request.body);
    return { data: await service.transition(ctx, id, body) };
  });

  fastify.delete('/api/cong-viec/:id', async (request) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    await service.softDelete(ctx, id);
    return { data: { success: true } };
  });

  fastify.get('/api/cong-viec/:id/lich-su', async (request) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    return { data: await service.getHistory(ctx, id) };
  });

  fastify.get('/api/cong-viec/:id/viec-con', async (request) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    return { data: await service.listViecCon(ctx, id) };
  });

  fastify.post('/api/cong-viec/:id/viec-con', async (request, reply) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    const body = taoViecConSchema.parse(request.body);
    const data = await service.addViecCon(ctx, id, body);
    reply.status(201).send({ data });
  });

  fastify.patch('/api/cong-viec/:id/viec-con/:vcId', async (request) => {
    const ctx = parseAuth(request);
    const { id, vcId } = request.params as any;
    const body = capNhatViecConSchema.parse(request.body);
    return { data: await service.updateViecCon(ctx, id, vcId, body) };
  });

  fastify.delete('/api/cong-viec/:id/viec-con/:vcId', async (request) => {
    const ctx = parseAuth(request);
    const { id, vcId } = request.params as any;
    await service.deleteViecCon(ctx, id, vcId);
    return { data: { success: true } };
  });

  fastify.get('/api/cong-viec/:id/binh-luan', async (request) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    const query = request.query as any;
    const result = await service.listBinhLuan(ctx, id, Number(query.page || 1), Number(query.limit || 50));
    return { data: result.items, meta: { page: Number(query.page || 1), limit: Number(query.limit || 50), total: result.total } };
  });

  fastify.post('/api/cong-viec/:id/binh-luan', async (request, reply) => {
    const ctx = parseAuth(request);
    const { id } = request.params as any;
    const body = taoBinhLuanSchema.parse(request.body);
    const data = await service.addBinhLuan(ctx, id, body);
    reply.status(201).send({ data });
  });
}
