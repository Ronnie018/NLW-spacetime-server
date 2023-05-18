import 'dotenv/config';

import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { memoriesRoutes } from './routes/memories';
import { authRoutes } from './routes/auth';

const app = fastify();

app.register(memoriesRoutes);

app.register(authRoutes);

app.register(jwt, {
  secret: 'ikgtgfgthyujikoli7mjg14DEG1[W44maf',
});

app.register(cors, {
  origin: ['http://localhost:3000', 'production_url'],
});

app.listen({ port: 3333 }).then(() => {
  console.log('server running on http://localhost:3333');
});
