# HR Administration System

## Tech Stack

- Next.js (T3)
- TypeScript
- Prisma + SQLite
- NextAuth (Credentials)
- tRPC
- Tailwind + shadcn/ui
- Zod + react-hook-form

## Setup

1. Install deps
   npm install

2. Create .env
   DATABASE_URL="file:./db.sqlite"
   AUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"

3. Migrate DB
   npx prisma migrate dev

4. Seed
   npx prisma db seed

5. Run
   npm run dev

## Demo Users

- HR Admin
  - Email: hradmin@test.com
  - Password: TestPass1234
- Manager
  - Email: manager@test.com
  - Password: Password123#
- Employee
  - Email: employee@test.com
  - Password: Password123#

## Notes

- Default password for new employees: Password123#
- Logout button is in the top-right header
- Employees/Departments lists include Edit + Activate/Deactivate actions
- Filters/search/pagination UI is present as placeholders (not functional yet)
