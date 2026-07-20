import { LoginForm } from "@/features/auth/login/components/LoginForm";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";
import { LockKeyhole } from "lucide-react";

export function LoginPage() {
  return (
    <AuthSplitLayout
      title={<>Temukan Tempat<br className="hidden xl:block" /> Magang Impianmu</>}
      description="Bergabunglah dengan ribuan mahasiswa lainnya untuk berbagi pengalaman dan mendapatkan insights eksklusif seputar dunia magang."
      // imageUrl="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1400"
    >
      <div className="space-y-8">
        <div className="flex flex-col items-start gap-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316] shadow-sm shadow-orange-500/10 ring-1 ring-orange-100">
            <LockKeyhole className="size-5" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Welcome Back
            </h1>
            <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-base">
              Enter your email below to login to your account
            </p>
          </div>
        </div>

        <LoginForm />
      </div>
    </AuthSplitLayout>
  );
}
