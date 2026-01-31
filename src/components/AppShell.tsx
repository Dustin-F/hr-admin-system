
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>HR Administration System</div>
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            type="button"
          >
            Log out
          </button>
        </div>
      </div>
      <div className="flex">
        <div className="w-56 border-r p-4">
          <div className="mb-2 text-sm font-semibold">Menu</div>
          <div className="space-y-2 text-sm">
            <Link className="block hover:underline" href="/employees">
              Employees
            </Link>
            <Link className="block hover:underline" href="/departments">
              Departments
            </Link>
          </div>
        </div>
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}