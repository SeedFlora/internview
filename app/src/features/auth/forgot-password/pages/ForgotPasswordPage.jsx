import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, MailCheck } from "lucide-react";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/api/authApi";

const schema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      // The backend always responds success (no account enumeration); show the
      // same confirmation regardless.
      setSent(true);
      toast.success(res.message || "Reset link sent if the email is registered");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      title={<>Lupa Kata Sandi?<br className="hidden xl:block" /> Tenang saja.</>}
      description="Masukkan email akunmu dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi."
    >
      <div className="space-y-8">
        <div className="flex flex-col items-start gap-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316] shadow-sm shadow-orange-500/10 ring-1 ring-orange-100">
            {sent ? <MailCheck className="size-5" /> : <Mail className="size-5" />}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {sent ? "Cek Email Kamu" : "Reset Password"}
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              {sent
                ? "Jika email tersebut terdaftar, kami telah mengirim tautan untuk mengatur ulang kata sandi. Tautan berlaku selama 30 menit."
                : "Masukkan email yang terdaftar untuk menerima tautan reset kata sandi."}
            </p>
          </div>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Tidak menerima email? Periksa folder spam, atau{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-medium text-[#F97316] underline-offset-4 hover:underline"
              >
                coba lagi
              </button>
              .
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-[#F97316] underline-offset-4 hover:underline"
            >
              &larr; Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl bg-[#F97316] text-base font-semibold hover:bg-[#EA580C]">
                {submitting ? "Mengirim..." : "Kirim Tautan Reset"}
              </Button>
            </FieldGroup>

            <p className="text-center text-sm text-slate-500">
              Ingat kata sandimu?{" "}
              <Link to="/login" className="font-medium text-[#F97316] underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthSplitLayout>
  );
}
