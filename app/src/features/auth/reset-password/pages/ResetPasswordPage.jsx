import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { LockKeyhole, ShieldAlert } from "lucide-react";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isPassword } from "@/helpers/validations";
import { resetPassword } from "@/api/authApi";

const schema = z
  .object({
    newPassword: isPassword(),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Kata sandi tidak cocok",
  });

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async ({ newPassword }) => {
    setSubmitting(true);
    try {
      const res = await resetPassword({ token, newPassword });
      toast.success(res.message || "Password reset. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Reset link is invalid or has expired. Please request a new one.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // No token in the URL -> the link was malformed or opened without it.
  if (!token) {
    return (
      <AuthSplitLayout
        title={<>Tautan Tidak Valid</>}
        description="Tautan reset kata sandi tidak lengkap atau sudah tidak berlaku."
      >
        <div className="space-y-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <ShieldAlert className="size-5" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Tautan Tidak Valid
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              Tautan reset kata sandi tidak lengkap. Silakan minta tautan baru.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-block text-sm font-medium text-[#F97316] underline-offset-4 hover:underline"
          >
            Minta tautan reset baru
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      title={<>Buat Kata Sandi<br className="hidden xl:block" /> Baru</>}
      description="Pilih kata sandi baru yang kuat untuk mengamankan akunmu."
    >
      <div className="space-y-8">
        <div className="flex flex-col items-start gap-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316] shadow-sm shadow-orange-500/10 ring-1 ring-orange-100">
            <LockKeyhole className="size-5" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Set New Password
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              Masukkan kata sandi baru untuk akunmu.
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup className="gap-5">
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="newPassword">Kata Sandi Baru</FieldLabel>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      {...field}
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password"
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
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">Konfirmasi Kata Sandi</FieldLabel>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
                    />
                  </div>
                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
                  )}
                </Field>
              )}
            />

            <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl bg-[#F97316] text-base font-semibold hover:bg-[#EA580C]">
              {submitting ? "Menyimpan..." : "Reset Password"}
            </Button>
          </FieldGroup>

          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-[#F97316] underline-offset-4 hover:underline">
              &larr; Kembali ke Login
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
