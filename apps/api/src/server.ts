import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { MongoClient } from 'mongodb';
import { 
  MemoryCongViecRepository, 
  MemoryLichSuRepository, 
  MemoryViecConRepository, 
  MemoryBinhLuanRepository, 
  MemoryDanhMucRepository 
} from './repositories/memory';
import {
  MongoCongViecRepository,
  MongoLichSuRepository,
  MongoViecConRepository,
  MongoBinhLuanRepository,
  MongoDanhMucRepository
} from './repositories/mongo';
import { CongViecService } from './services/cong-viec.service';
import congViecRoutes from './routes/cong-viec.routes';
import { seedDb } from './seed';
import { DomainError } from './domain';
import { ZodError } from 'zod';

const fastify = Fastify({ logger: true });

async function start() {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  let congViecRepo, lichSuRepo, viecConRepo, binhLuanRepo, danhMucRepo;

  if (process.env.MONGO_URL) {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'erp');
    
    congViecRepo = new MongoCongViecRepository(db);
    lichSuRepo = new MongoLichSuRepository(db);
    viecConRepo = new MongoViecConRepository(db);
    binhLuanRepo = new MongoBinhLuanRepository(db);
    danhMucRepo = new MongoDanhMucRepository(db);

    await Promise.all([
      congViecRepo.setupIndexes(),
      lichSuRepo.setupIndexes(),
      viecConRepo.setupIndexes(),
      binhLuanRepo.setupIndexes(),
      danhMucRepo.setupIndexes()
    ]);
  } else {
    console.log('Using in-memory repository...');
    congViecRepo = new MemoryCongViecRepository();
    lichSuRepo = new MemoryLichSuRepository();
    viecConRepo = new MemoryViecConRepository();
    binhLuanRepo = new MemoryBinhLuanRepository();
    danhMucRepo = new MemoryDanhMucRepository();
  }

  const existingDuAn = await danhMucRepo.listDuAn('ct-long-do');
  if (existingDuAn.length === 0) {
    console.log('Seeding database...');
    await seedDb(congViecRepo, lichSuRepo, viecConRepo, binhLuanRepo, danhMucRepo);
  }

  const service = new CongViecService(congViecRepo, lichSuRepo, viecConRepo, binhLuanRepo, danhMucRepo);

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.setErrorHandler((error, request, reply) => {
    const err = error as any;
    console.error('[ERROR_HANDLER]', {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      status: err?.status,
      isDomainError: err instanceof DomainError,
      nameCheck: err?.name === 'DomainError',
      constructor: err?.constructor?.name,
      stack: err?.stack?.split('\n').slice(0, 3).join('\n')
    });
    if (err instanceof DomainError || err?.name === 'DomainError') {
      const code = err.code || 'BAD_REQUEST';
      const status = err.status || 400;
      reply.status(status).send({ error: { code, message: err.message } });
    } else if (err instanceof ZodError || err?.name === 'ZodError') {
      const zodError = err as ZodError;
      const messages = zodError.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
      reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: messages } });
    } else {
      reply.status(500).send({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Lỗi hệ thống' } });
    }
  });

  await fastify.register(congViecRoutes, { service, danhMucRepo });

  const port = Number(process.env.PORT || 3000);
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`Server listening on port ${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
