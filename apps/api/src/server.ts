import Fastify from 'fastify';
import cors from '@fastify/cors';
import { MemoryCongViecRepository } from './repositories/memory.js';
import { CongViecService, DomainError } from './services/cong-viec.service.js';
import { registerCongViecRoutes } from './routes/cong-viec.routes.js';
import { seedData } from './seed.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get('/health', async () => ({ data: { status: 'ok' } }));

const repository = new MemoryCongViecRepository();
await seedData(repository);
await registerCongViecRoutes(app, new CongViecService(repository));

app.setErrorHandler((error, _request, reply) => {
	if (error instanceof DomainError) return reply.code(error.status).send({ error: { code: error.code, message: error.message } });
	if (error.name === 'ZodError') return reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' } });
	app.log.error(error);
	return reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Có lỗi máy chủ' } });
});

const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: '0.0.0.0' });
