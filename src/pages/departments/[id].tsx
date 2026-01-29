import { useRouter } from "next/router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (departmentQuery.data && !isNew) {
    form.reset({
      name: departmentQuery.data.name,
      status: departmentQuery.data.status ?? "ACTIVE",
      managerId: departmentQuery.data.managerId ?? "",
    });
  }

  if (departmentQuery.isLoading && !isNew) {
    return <div className="p-6">Loading...</div>;
  }

  const createDepartment = api.department.create.useMutation();
  const updateDepartment = api.department.update.useMutation();

  const onSubmit = async (values: FormValues) => {
    if (isNew) {
      await createDepartment.mutateAsync(values);
    } else if (id) {
      await updateDepartment.mutateAsync({ id, ...values });
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

            <div>
              <label className="mb-1 block text-sm">Status</label>
              <Input placeholder="ACTIVE" {...form.register("status")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Manager ID</label>
              <Input placeholder="Employee ID" {...form.register("managerId")} />
            </div>

            <Button type="submit">{isNew ? "Create" : "Save"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
