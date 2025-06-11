import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";

import { z } from "zod";

export const projectRouter = createTRPCRouter({
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return prisma.project.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }),

  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          ownerId: ctx.session.user.id,
        },
      });

      return project;
    }),

    updateProject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return prisma.project.update({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),

 deleteProject: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const tasks = await prisma.task.findMany({
      where: { projectId: input.id },
      select: { id: true },
    });

    const taskIds = tasks.map((t) => t.id);

    await prisma.taskAssignment.deleteMany({
      where: {
        taskId: { in: taskIds },
      },
    });

    await prisma.task.deleteMany({
      where: {
        id: { in: taskIds },
      },
    });

    return prisma.project.delete({
      where: {
        id: input.id,
        ownerId: ctx.session.user.id,
      },
    });
  }),

});



