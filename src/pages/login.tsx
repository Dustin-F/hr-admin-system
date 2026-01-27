import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";





const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setError(null);

        const res = await signIn("credentials", {
            redirect: false,
            email: values.email,
            password: values.password,
        });

        if (res?.ok) {
            await router.push("/");
        } else {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm">Email</label>
                            <Input type="email" {...form.register("email")} />
                            {form.formState.errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm">Password</label>
                            <Input type="password" {...form.register("password")} />
                            {form.formState.errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}