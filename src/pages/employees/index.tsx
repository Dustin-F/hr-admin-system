import { api } from "@/utils/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EmployeesPage() {
  const { data, isLoading } = api.employee.list.useQuery();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data || data.length === 0) {
    return <div className="p-6">No employees found.</div>;
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Employees</h1>
      <Table>
  <TableHeader>
    <TableRow>
      <TableHead>First Name</TableHead>
      <TableHead>Last Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Manager</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data?.map((emp) => (
      <TableRow key={emp.id}>
        <TableCell>{emp.firstName}</TableCell>
        <TableCell>{emp.lastName}</TableCell>
        <TableCell>{emp.email}</TableCell>
        <TableCell>{emp.manager?.firstName ?? "-"}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
    </div>
  );
}