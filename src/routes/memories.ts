import { FastifyInstance, FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';
import { z } from 'zod';

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyToken);

  // get all memories
  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      };
    });
  });

  // create memory
  app.post('/memories', async (request: FastifyRequest) => {
    const bodySchema = z.object({
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
      coverUrl: z.string(),
    });

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body);

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    });

    return memory;
  });

  // get memory
  app.get('/memories/:id', async (request: FastifyRequest, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    });

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply
        .send({
          message: 'Unauthorized',
        })
        .code(401);
    }

    return memory;
  });

  // get memory
  app.put('/memories/:id', async (request: FastifyRequest, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const bodySchema = z.object({
      content: z.string(),
      isPublic: z.coerce.boolean().default(false),
      coverUrl: z.string(),
    });

    const { content, isPublic, coverUrl } = bodySchema.parse(request.body);

    let memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    });

    if (memory.userId !== request.user.sub) {
      return reply
        .send({
          message: 'Unauthorized',
        })
        .code(401);
    }

    memory = await prisma.memory.update({
      where: { id },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    });

    return memory;
  });

  // delete memory
  app.delete('/memories/:id', async (request: FastifyRequest, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    });

    if (memory.userId !== request.user.sub) {
      return reply
        .send({
          message: 'Unauthorized',
        })
        .code(401);
    }

    await prisma.memory.delete({
      where: { id },
    });
  });
}

async function verifyToken(request: FastifyRequest) {
  await request.jwtVerify();
}