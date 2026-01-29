
export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="border-b p-4">HR Administration System</div>
            <div className="flex">
            <div className="w-56 border-r p-4">
  <div className="mb-2 text-sm font-semibold">Menu</div>
  <div className="space-y-2 text-sm">
    <a className="block hover:underline" href="/employees">Employees</a>
    <a className="block hover:underline" href="/departments">Departments</a>
  </div>
</div>
                <div className="flex-1 p-6">{children}</div>
            </div>
        </div>
    );
}