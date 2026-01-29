import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  requireRole,
} from "@/server/api/trpc";

const employeeIdSchema = z.object({
  id: z.string(),
});

const employeeCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  managerId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

const employeeUpdateSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  managerId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const employeeRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const role = ctx.session.user.role;
    const userId = ctx.session.user.id;

    if (role === "HR_ADMIN") {
      return ctx.db.employee.findMany({
        include: { manager: true },
        orderBy: { lastName: "asc" },
      });
    }

    if (role === "EMPLOYEE") {
      return ctx.db.employee.findMany({
        where: { user: { id: userId } },
        include: { manager: true },
        orderBy: { lastName: "asc" },
      });
    }

    return ctx.db.employee.findMany({
      where: {
        OR: [
          { user: { id: userId } },
          {
            departments: {
              some: {
                department: {
                  manager: {
                    user: { id: userId },
                  },
                },
              },
            },
          },
        ],
      },
      include: { manager: true },
      orderBy: { lastName: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(employeeIdSchema)
    .query(async ({ ctx, input }) => {
      // TODO: apply same visibility rules as list
      return ctx.db.employee.findFirst({
        where: { id: input.id },
        include: { manager: true },
      });
    }),

  create: requireRole(["HR_ADMIN"])
    .input(employeeCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const passwordHash = await bcrypt.hash("Password123#", 10);

      const result = await ctx.db.$transaction(async (tx) => {
        const employee = await tx.employee.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            email: input.email,
            managerId: input.managerId ?? null,
            status: input.status ?? "ACTIVE",
          },
        });

        const user = await tx.user.create({
          data: {
            email: input.email,
            passwordHash,
            role: "EMPLOYEE",
            employeeId: employee.id,
          },
        });

        return { employee, user };
      });

      return result.employee;
    }),

  update: protectedProcedure
    .input(employeeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const role = ctx.session.user.role;
      const userId = ctx.session.user.id;

      const isSelf = await ctx.db.employee.findFirst({
        where: { id: input.id, user: { id: userId } },
      });

      if (role !== "HR_ADMIN" && !isSelf) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const data =
        role === "HR_ADMIN"
          ? {
              firstName: input.firstName,
              lastName: input.lastName,
              phone: input.phone,
              email: input.email,
              managerId: input.managerId ?? null,
              status: input.status ?? "ACTIVE",
            }
          : {
              firstName: input.firstName,
              lastName: input.lastName,
              phone: input.phone,
              email: input.email,
            };

      return ctx.db.employee.update({
        where: { id: input.id },
        data,
      });
    }),
});
