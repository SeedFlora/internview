import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from "react";
import { checkEmail } from "@/api/userApi";
import { KeyRound, LockKeyhole, Mail } from "lucide-react";

export function StepAccount({ form }) {
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const debounceTimerRef = useRef(null);
  const emailValue = form.watch("email");

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset error in form
    if (form.formState.errors.email?.type === "server") {
      form.clearErrors("email");
    }

    // Only check if email is valid email format
    if (!emailValue || !emailValue.includes("@")) {
      return;
    }

    // Debounce email check (500ms)
    debounceTimerRef.current = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const response = await checkEmail(emailValue);
        if (!response.success) {
          form.setError("email", {
            type: "server",
            message: response.message,
          });
        }
      } catch (error) {
        // Handle axios error dengan status code 409 (Conflict)
        if (error.response?.status === 409) {
          const errorMessage = error.response.data?.message || "Email already used!";
          form.setError("email", {
            type: "server",
            message: errorMessage,
          });
        } else {
          // NetworkError atau error lainnya, skip untuk sekarang
          console.error("Email check error:", error);
        }
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [emailValue, form]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...form.register("email")}
            disabled={isCheckingEmail}
            className={`h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm shadow-none transition-colors focus-visible:bg-white ${isCheckingEmail ? "opacity-75" : ""}`}
          />
          {isCheckingEmail && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#F97316]" />
            </div>
          )}
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...form.register("password")}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...form.register("confirmPassword")}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
          />
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>
    </div>
  );
}