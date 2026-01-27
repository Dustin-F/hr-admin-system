import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";
import type { Adapter } from "next-auth/adapters";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      employeeId: string | null;
    } & DefaultSession["user"];
    
  }
  interface User {
    role: string;
    employeeId: string | null;
  }


}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials);
      
        if (!parsed.success) return null;
      
        const { email, password } = parsed.data;
      
        const user = await db.user.findUnique({
          where: { email },
        });
      
        if (!user) return null;
      
        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;
      
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db) as Adapter,
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
        employeeId: user.employeeId,
      },
    }),
  },
} satisfies NextAuthConfig;
