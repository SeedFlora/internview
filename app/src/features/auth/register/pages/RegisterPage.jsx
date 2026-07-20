import { Link } from "react-router-dom";
import { AuthSplitLayout } from "@/features/auth/components/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { StepAccount } from "@/features/auth/register/components/StepAccount";
import { StepPersonal } from "@/features/auth/register/components/StepPersonal";
import { StepAcademic } from "@/features/auth/register/components/StepAcademic";
import { useRegisterWizard } from "@/features/auth/register/hooks/useRegisterWizard";
import { GraduationCap } from "lucide-react";

export function RegisterPage() {
  const { step, form, onNext, onBack, onSubmit, isLastStep } = useRegisterWizard();

  const steps = [
    <StepAccount form={form} key="step-1" />,
    <StepPersonal form={form} key="step-2" />,
    <StepAcademic form={form} key="step-3" />,
  ];

  const stepTitles = [
    "Credential Information",
    "Personal Information",
    "Academic Data",
  ];

  const stepDescriptions = [
    "Step 1 of 3 — Fill out the form to continue.",
    "Step 2 of 3 — Fill out the form to continue.",
    "Step 3 of 3 — Fill out the form to finish.",
  ];

  return (
    <AuthSplitLayout
      title={<>Bangun Karir<br className="hidden xl:block" /> Impianmu</>}
      description="Jadilah bagian dari komunitas mahasiswa dan alumni BINUS University untuk meraih pengalaman berharga."
      // imageUrl="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1400"
    >
      <div className="space-y-8">
        <div className="space-y-3 text-center lg:text-left">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316] shadow-sm shadow-orange-500/10 ring-1 ring-orange-100 lg:mx-0">
            <GraduationCap className="size-5" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Create Your Account
            </h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">
              {stepDescriptions[step]}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="relative flex items-center justify-between px-1">
            <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-slate-200" />
            {[0, 1, 2].map((index) => {
              const active = step >= index;

              return (
                <div
                  key={index}
                  className={`relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    active ? "bg-[#F97316] text-white shadow-lg shadow-orange-500/30" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>

          <p className="text-sm font-medium text-slate-700">{stepTitles[step]}</p>
        </div>

        <div className="space-y-6">{steps[step]}</div>

        {step === 0 ? (
          <div className="pt-1">
            <Button
              onClick={onNext}
              disabled={!form.formState.isValid}
              className="h-12 w-full rounded-xl bg-[#F97316] text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-[#EA580C] hover:shadow-orange-500/30"
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={onBack}
              className="h-12 flex-1 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back
            </Button>

            <Button
              onClick={isLastStep ? onSubmit : onNext}
              disabled={!form.formState.isValid}
              className="h-12 flex-1 rounded-xl bg-[#F97316] text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-[#EA580C] hover:shadow-orange-500/30"
            >
              {isLastStep ? "Submit" : "Next"}
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#F97316] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
