import { useState, useMemo } from "react";
import { api } from "@/utils/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function EmployeesPage() {
  const { data, isLoading } = api.employee.list.useQuery();
  const { data: departments } = api.department.list.useQuery();
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "HR_ADMIN";
  const utils = api.useUtils();
  const updateEmployee = api.employee.update.useMutation({
    onSuccess: () => void utils.employee.list.invalidate(),
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");

  const uniqueManagers = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    return data
      .map((emp) => emp.manager)
      .filter((m): m is NonNullable<typeof m> => !!m && !!m.id)
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((emp) => {
      if (statusFilter && emp.status !== statusFilter) return false;
      if (managerFilter && emp.managerId !== managerFilter) return false;
      if (departmentFilter) {
        const inDept = emp.departments?.some(
          (ed: { departmentId: string }) => ed.departmentId === departmentFilter
        );
        if (!inDept) return false;
      }
      return true;
    });
  }, [data, statusFilter, departmentFilter, managerFilter]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data || data.length === 0) {
    return <div className="p-6">No employees found.</div>;
  }

  const handleClearFilters = () => {
    setStatusFilter("");
    setDepartmentFilter("");
    setManagerFilter("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Employees</h1>

      <div className="mb-4 rounded border p-4">
        <div className="mb-3 text-sm font-semibold">Filters</div>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <label className="mb-1 block">Status</label>
            <select
              className="w-full rounded border p-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">(All)</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block">Department</label>
            <select
              className="w-full rounded border p-2"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">- Select -</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block">Manager</label>
            <select
              className="w-full rounded border p-2"
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
            >
              <option value="">- Select -</option>
              {uniqueManagers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" type="button" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Show per page</span>
          <select className="rounded border p-1">
            <option>10</option>
            <option>20</option>
            <option>50</option>
            <option>All</option>
          </select>
        </div>
        <input
          className="w-56 rounded border p-2 text-sm"
          placeholder="Search..."
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No employees match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.firstName}</TableCell>
                <TableCell>{emp.lastName}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.manager?.firstName ?? "-"}</TableCell>
                <TableCell>{emp.status}</TableCell>
                <TableCell className="space-x-2">
                  <Link className="text-sm underline" href={`/employees/${emp.id}`}>
                    Edit
                  </Link>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateEmployee.mutate({
                          id: emp.id,
                          firstName: emp.firstName,
                          lastName: emp.lastName,
                          phone: emp.phone,
                          email: emp.email,
                          managerId: emp.managerId ?? null,
                          status: emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                        })
                      }
                    >
                      {emp.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="mt-4 space-x-2 text-sm">
        <button className="rounded border px-2 py-1">1</button>
        <button className="rounded border px-2 py-1">2</button>
        <button className="rounded border px-2 py-1">3</button>
      </div>
      {isAdmin && (
        <div className="mt-4">
          <Button asChild>
            <Link href="/employees/new">Create Employee</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
