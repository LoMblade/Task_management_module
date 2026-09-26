import type { FastifyInstance, FastifyRequest } from 'fastify';
import { congViecQuerySchema, taoCongViecSchema, capNhatCongViecSchema, capNhatTienDoSchema, chuyenTrangThaiSchema } from '@erp/contracts';
import type { AuthContext } from '../domain.js';
import { CongViecService, DomainError } from '../services/cong-viec.service.js';

function context(request: FastifyRequest): AuthContext {
  const raw = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!raw) throw new DomainError('UNAUTHORIZED', 'Thiếu token đăng nhập', 401);
  try {
    const payload = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Partial<AuthContext>;
    if (!payload.userId || !payload.congTyId) throw new Error('invalid');
    return { userId: payload.userId, congTyId: payload.congTyId };
  } catch { throw new DomainError('UNAUTHORIZED', 'Token đăng nhập không hợp lệ', 401); }
}

export async function registerCongViecRoutes(app: FastifyInstance, service: CongViecService) {
  app.get('/api/cong-viec', async (request) => {
    const query = congViecQuerySchema.parse(request.query);
    const result = await service.list(context(request), { ...query, today: new Date().toISOString().slice(0, 10) });
    return { data: result.items, meta: { page: query.page, limit: query.limit, total: result.total } };
  });
  app.get('/api/cong-viec/:id', async (request) => ({ data: await service.get(context(request), (request.params as { id: string }).id) }));
  app.post('/api/cong-viec', async (request, reply) => reply.code(201).send({ data: await service.create(context(request), taoCongViecSchema.parse(request.body)) }));
  app.patch('/api/cong-viec/:id', async (request) => ({ data: await service.update(context(request), (request.params as { id: string }).id, capNhatCongViecSchema.parse(request.body)) }));
  app.patch('/api/cong-viec/:id/tien-do', async (request) => ({ data: await service.progress(context(request), (request.params as { id: string }).id, capNhatTienDoSchema.parse(request.body)) }));
  app.post('/api/cong-viec/:id/trang-thai', async (request) => ({ data: await service.transition(context(request), (request.params as { id: string }).id, chuyenTrangThaiSchema.parse(request.body)) }));
  app.delete('/api/cong-viec/:id', async (request) => ({ data: await service.softDelete(context(request), (request.params as { id: string }).id) }));
}
