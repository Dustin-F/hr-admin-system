import { api } from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DepartmentsPage() {
  const { data, isLoading } = api.department.list.useQuery();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data || data.length === 0) {
    return <div className="p-6">No departments found.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button asChild>
          <Link href="/departments/new">Create Department</Link>
        </Button>
      </div>
  
      <h1 className="text-2xl font-semibold">Departments</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell>{dept.name}</TableCell>
              <TableCell>{dept.status}</TableCell>
              <TableCell>{dept.manager?.firstName ?? "-"}</TableCell>
              <TableCell>
                <Link className="text-sm underline" href={`/departments/${dept.id}`}>
                  Edit
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}