"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { loginSchema, queryKeys, storeSession } from "@/lib/core";
import { login } from "@/services/auth/client";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
} from "@/components/ui/primitives";

const demoCredentials = {
  email: "olivia@northstarops.com",
  password: "admin12345",
};

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: demoCredentials.email,
      password: demoCredentials.password,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await login(values);
      storeSession(response.session);
      queryClient.setQueryData(queryKeys.auth.session, response.session);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.",
      });
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
            Secure access
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Sign in to the dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Use the demo credentials below to access the operations workspace.
          </p>
        </div>

        <div className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          <p className="font-semibold">Demo account</p>
          <p className="mt-2 font-mono">{demoCredentials.email}</p>
          <p className="font-mono">{demoCredentials.password}</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" className="pl-9" {...register("email")} />
            </div>
            {errors.email ? (
              <p className="text-sm text-danger">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-9"
                {...register("password")}
              />
            </div>
            {errors.password ? (
              <p className="text-sm text-danger">{errors.password.message}</p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {errors.root.message}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {!isSubmitting ? <ArrowRight className="mr-2 size-4" /> : null}
            Continue to dashboard
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
