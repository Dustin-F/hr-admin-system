import { useRouter } from "next/router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  managerId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmployeeEditPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const isNew = id === "new";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      managerId: "",
      status: "ACTIVE",
    },
  });

  const employeeQuery = api.employee.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id && id !== "new" },
  );

  if (employeeQuery.data && !isNew) {
    form.reset({
      firstName: employeeQuery.data.firstName,
      lastName: employeeQuery.data.lastName,
      phone: employeeQuery.data.phone,
      email: employeeQuery.data.email,
      managerId: employeeQuery.data.managerId ?? "",
      status: employeeQuery.data.status ?? "ACTIVE",
    });
  }

  if (employeeQuery.isLoading && !isNew) {
    return <div className="p-6">Loading...</div>;
  }

  const createEmployee = api.employee.create.useMutation();
  const updateEmployee = api.employee.update.useMutation();

  const onSubmit = async (values: FormValues) => {
    const cleaned = {
      ...values,
      managerId: values.managerId?.trim() ? values.managerId : undefined,
    };
  
    if (isNew) {
      await createEmployee.mutateAsync(cleaned);
    } else if (id) {
      await updateEmployee.mutateAsync({ id, ...cleaned });
    }
    void router.push("/employees");
  };

  return (
    <div className="p-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{id === "new" ? "Create Employee" : "Edit Employee"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">First Name</label>
              <Input {...form.register("firstName")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Last Name</label>
              <Input {...form.register("lastName")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Phone</label>
              <Input {...form.register("phone")} />
            </div>

            <div>
              <label className="mb-1 block text-sm">Email</label>
              <Input type="email" {...form.register("email")} />
            </div>

            <Button type="submit">{isNew ? "Create" : "Save"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}