# HR Administration System

A role-based HR admin app: employees, departments, and assignments. Built with the [T3 Stack](https://create.t3.gg/).

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Prisma** + **SQLite**
- **NextAuth** (Credentials)
- **tRPC** + **React Query**
- **Tailwind CSS** + **shadcn/ui**
- **Zod** + **react-hook-form**

---

## How to Run This App

To run this app on another machine (e.g. after cloning from GitHub): clone the repo, install dependencies, add a `.env` file, run database migrations, optionally seed demo users, then start the dev server. Details below.

**Quick summary:**  
Clone → `npm install` → create `.env` (see step 2) → `npx prisma migrate deploy` → optional: `npx prisma db seed` → `npm run dev`

### Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm** (or pnpm / yarn)

### 1. Clone and install

```bash
git clone https://github.com/Dustin-F/hr-admin-system.git
cd hr-admin-system
npm install
```

The Prisma client is generated automatically after `npm install` (postinstall script).

### 2. Environment variables

Create a `.env` file in the project root (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and set at least:

```env
# Prisma – SQLite file path (relative to prisma/)
DATABASE_URL="file:./db.sqlite"

# NextAuth – required for sessions (generate with: npx auth secret)
AUTH_SECRET="your-secret-at-least-32-chars"

# NextAuth – app URL (for local dev)
NEXTAUTH_URL="http://localhost:3000"
```

For a random `AUTH_SECRET`:

```bash
npx auth secret
```

### 3. Database setup

Create the SQLite DB and run migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma client (usually runs after `npm install` via `postinstall`; run again if needed):

```bash
npx prisma generate
```

### 4. Seed (optional but recommended)

Creates demo users so you can log in:

```bash
npx prisma db seed
```

### 5. Run the app

**Development:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the login page. If you ran the seed, log in with the demo HR Admin user (see Demo Login below).

**Production build:**

```bash
npm run build
npm start
```

---

## Demo Login (after seeding)

| Role     | Email             | Password     |
|----------|-------------------|--------------|
| HR Admin | hradmin@test.com  | TestPass1234 |
| Manager  | manager@test.com  | Password123# |
| Employee | employee@test.com | Password123# |

*(If your seed only creates the HR Admin user, use that one; add Manager/Employee via the app or extend the seed.)*

---

## App behavior

- **HR Admin:** Full access – all employees/departments, create/edit employees, assign roles (Employee / Manager / HR Admin), assign employees to multiple departments, activate/deactivate.
- **Manager:** Sees employees in departments they manage; can edit those employees’ contact info.
- **Employee:** Sees only their own profile; can edit own contact info.
- New employees created by HR get default password: **Password123#** (user should change after first login if you add that flow).

---

## Useful commands

| Command              | Description                    |
|----------------------|--------------------------------|
| `npm run dev`        | Start dev server               |
| `npm run build`      | Production build               |
| `npm start`          | Run production server          |
| `npx prisma studio`  | Open Prisma Studio (DB UI)     |
| `npx prisma migrate dev` | Create new migration (dev) |
| `npx prisma db push` | Push schema without migration  |
| `npm run lint`       | Run ESLint                     |
| `npm run typecheck`  | TypeScript check               |

---

## Project structure (high level)

- `prisma/` – schema, migrations, seed
- `src/pages/` – Next.js pages (login, employees, departments)
- `src/server/api/routers/` – tRPC routers (employee, department)
- `src/server/auth/` – NextAuth config
- `src/components/` – shared UI (AppShell, shadcn components)

---

## Troubleshooting

- **“DATABASE_URL invalid”** – Ensure `.env` has `DATABASE_URL="file:./db.sqlite"` and the path is correct relative to the `prisma/` folder.
- **“AUTH_SECRET is not set”** – Add `AUTH_SECRET` to `.env` (e.g. output of `npx auth secret`).
- **Tables missing / Prisma errors** – Run `npx prisma migrate deploy` and `npx prisma generate`.
- **Can’t log in** – Run `npx prisma db seed` to create the demo HR Admin user.
