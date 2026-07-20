import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Controller } from "react-hook-form";
import { LockKeyhole, Mail } from "lucide-react";
import { useLoginForm } from "@/features/auth/login/hooks/useLoginForm";

export function LoginForm({ className, ...props }) {
  const { form, handleLogin } = useLoginForm();

  return (
    <form
      onSubmit={form.handleSubmit(handleLogin)}
      className={cn("space-y-6", className)}
      {...props}
    >
      <FieldGroup className="gap-5">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
                />
              </div>
              {fieldState.error && (
                <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between gap-3">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#F97316] underline-offset-4 transition-colors hover:text-[#EA580C] hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
                />
              </div>
              {fieldState.error && (
                <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
              )}
            </Field>
          )}
        />

        <Field className="pt-1">
          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#F97316] text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-[#EA580C] hover:shadow-orange-500/30"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-[#F97316] hover:underline">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
