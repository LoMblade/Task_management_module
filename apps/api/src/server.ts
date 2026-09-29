import Fastify from 'fastify';
import cors from '@fastify/cors';
import { 
  MemoryCongViecRepository, 
  MemoryLichSuRepository, 
  MemoryViecConRepository, 
  MemoryBinhLuanRepository, 
  MemoryDanhMucRepository 
} from './repositories/memory';
import { CongViecService } from './services/cong-viec.service';
import congViecRoutes from './routes/cong-viec.routes';
import { seedDb } from './seed';
import { DomainError } from './domain';
import { ZodError } from 'zod';

const fastify = Fastify({ logger: true });

async function start() {
  await fastify.register(cors);

  const congViecRepo = new MemoryCongViecRepository();
  const lichSuRepo = new MemoryLichSuRepository();
  const viecConRepo = new MemoryViecConRepository();
  const binhLuanRepo = new MemoryBinhLuanRepository();
  const danhMucRepo = new MemoryDanhMucRepository();

  await seedDb(congViecRepo, lichSuRepo, viecConRepo, binhLuanRepo, danhMucRepo);

  const service = new CongViecService(congViecRepo, lichSuRepo, viecConRepo, binhLuanRepo, danhMucRepo);

  fastify.get('/health', async () => ({ status: 'ok' }));

  await fastify.register(congViecRoutes, { service, danhMucRepo });

  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    if (error instanceof DomainError) {
      reply.status(error.status).send({ error: { code: error.code, message: error.message } });
    } else if (error instanceof ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: messages } });
    } else {
      reply.status(500).send({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi hệ thống' } });
    }
  });

  const port = Number(process.env.PORT || 3000);
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`Server listening on port ${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
