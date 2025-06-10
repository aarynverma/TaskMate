import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";

export const taskRouter = createTRPCRouter({
  getTasks: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return prisma.task.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        include: {
          assignees: {
            include: {
              user: true,
            },
          },
        },
      });
    }),

  createTask: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.string().optional(),
        status: z.enum(["todo", "in-progress", "done"]).default("todo"),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.task.create({ data: input });
    }),

  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum(["todo", "in-progress", "done"]),
      }),
    )
    .mutation(({ input }) => {
      return prisma.task.update({
        where: { id: input.taskId },
        data: { status: input.status },
      });
    }),

  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return prisma.task.update({
        where: { id },
        data,
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(({ input }) => {
      return prisma.task.delete({
        where: { id: input.taskId },
      });
    }),

  assignUserToTask: protectedProcedure
    .input(z.object({ taskId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.taskAssignment.create({
        data: {
          taskId: input.taskId,
          userId: input.userId,
        },
      });
    }),

  removeUserFromTask: protectedProcedure
    .input(z.object({ taskId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.taskAssignment.delete({
        where: {
          taskId_userId: {
            taskId: input.taskId,
            userId: input.userId,
          },
        },
      });
    }),
});
