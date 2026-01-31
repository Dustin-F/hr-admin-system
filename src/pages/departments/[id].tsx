import { useRouter } from "next/router";
import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

const formSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  managerId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DepartmentEditPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const isNew = id === "new";
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "HR_ADMIN";
  const employeesQuery = api.employee.list.useQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
      managerId: "",
    },
  });

  const departmentQuery = api.department.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id && id !== "new" },
  );

  useEffect(() => {
    if (departmentQuery.data && !isNew) {
      form.reset({
        name: departmentQuery.data.name,
        status: departmentQuery.data.status ?? "ACTIVE",
        managerId: departmentQuery.data.managerId ?? "",
      });
    }
  }, [departmentQuery.data, form, isNew]);

  const createDepartment = api.department.create.useMutation();
  const updateDepartment = api.department.update.useMutation();

  if (departmentQuery.isLoading && !isNew) {
    return <div className="p-6">Loading...</div>;
  }

  const onSubmit = async (values: FormValues) => {
    const cleaned = {
      ...values,
      managerId: values.managerId?.trim() ? values.managerId : undefined,
    };
    if (isNew) {
      await createDepartment.mutateAsync(cleaned);
    } else if (id) {
      await updateDepartment.mutateAsync({ id, ...cleaned });
    }
    void router.push("/departments");
  };

  return (
    <div className="p-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{isNew ? "Create Department" : "Edit Department"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">Name</label>
              <Input {...form.register("name")} />
            </div>

            {isAdmin && (
              <>
                <div>
                  <label className="mb-1 block text-sm">Manager</label>
                  <select
                    className="w-full rounded border p-2"
                    {...form.register("managerId")}
                  >
                    <option value="">- None -</option>
                    {employeesQuery.data?.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Status</label>
                  <select
                    className="w-full rounded border p-2"
                    {...form.register("status")}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit">{isNew ? "Create" : "Save"}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void router.push("/departments")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
