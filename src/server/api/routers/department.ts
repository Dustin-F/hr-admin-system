import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  requireRole,
} from "@/server/api/trpc";

const departmentIdSchema = z.object({
  id: z.string(),
});

const departmentCreateSchema = z.object({
  name: z.string().min(1),
  managerId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

const departmentUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  managerId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const departmentRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const role = ctx.session.user.role;
    const userId = ctx.session.user.id;

    if (role === "HR_ADMIN") {
      return ctx.db.department.findMany({
        include: { manager: true },
        orderBy: { name: "asc" },
      });
    }

    if (role === "MANAGER") {
      return ctx.db.department.findMany({
        where: { manager: { user: { id: userId } } },
        include: { manager: true },
        orderBy: { name: "asc" },
      });
    }

    return ctx.db.department.findMany({
      where: {
        employees: {
          some: {
            employee: { user: { id: userId } },
          },
        },
      },
      include: { manager: true },
      orderBy: { name: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(departmentIdSchema)
    .query(async ({ ctx, input }) => {
      const role = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (role === "HR_ADMIN") {
        return ctx.db.department.findFirst({
          where: { id: input.id },
          include: { manager: true },
        });
      }

      if (role === "MANAGER") {
        return ctx.db.department.findFirst({
          where: {
            id: input.id,
            manager: { user: { id: userId } },
          },
          include: { manager: true },
        });
      }

      return ctx.db.department.findFirst({
        where: {
          id: input.id,
          employees: {
            some: {
              employee: { user: { id: userId } },
            },
          },
        },
        include: { manager: true },
      });
    }),

  create: requireRole(["HR_ADMIN"])
    .input(departmentCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const managerId =
        input.managerId && input.managerId.trim() !== "" ? input.managerId : null;
      return ctx.db.department.create({
        data: {
          name: input.name,
          status: input.status ?? "ACTIVE",
          managerId,
        },
      });
    }),

  update: requireRole(["HR_ADMIN"])
    .input(departmentUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const managerId =
        input.managerId && input.managerId.trim() !== "" ? input.managerId : null;
      return ctx.db.department.update({
        where: { id: input.id },
        data: {
          name: input.name,
          status: input.status ?? "ACTIVE",
          managerId,
        },
      });
    }),
});
