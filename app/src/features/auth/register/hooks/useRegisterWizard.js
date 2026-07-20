import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { register } from "@/api/authApi";
import { checkEmail } from "@/api/userApi";
import { sanitizeFields } from "@/helpers/sanitize";
import {
  isEmail,
  isOptionalString,
  isPassword,
  isRequiredPhoneNumber,
  isRequiredString,
} from "@/helpers/validations";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const step1Schema = z
  .object({
    email: isEmail(),
    password: isPassword(),
    confirmPassword: isRequiredString(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const step2Schema = z.object({
  firstName: isRequiredString(1),
  lastName: isOptionalString(),
  phoneNumber: isRequiredPhoneNumber(),
});

// BUG FIX: was isRequiredString(5, 10) which accepts any 5-10 chars, so IDs the
// backend rejects (e.g. "23012345") passed every wizard step and only failed at
// the final submit with a bare error. Mirror the backend RegisterIdValidator
// exactly: a 5-char lecturer id starting 'D', or a 10-char student id starting '2'.
const step3Schema = z.object({
  registerId: z
    .string()
    .refine(
      (v) => (v.length === 5 && v.startsWith("D")) || (v.length === 10 && v.startsWith("2")),
      { message: "NIM harus 10 digit diawali '2', atau ID dosen 5 karakter diawali 'D'" },
    ),
  regionId: isRequiredString(1),
  majorId: isRequiredString(1),
});

const allSchemas = [step1Schema, step2Schema, step3Schema];

export const useRegisterWizard = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const activeSchema = useMemo(() => allSchemas[step], [step]);

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(activeSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      registerId: "",
      regionId: "",
      majorId: "",
    },
  });

  const onNext = async () => {
    const stepKeys = Object.keys(allSchemas[step].shape);
    const isValid = await form.trigger(stepKeys);

    if (!isValid) {
      toast.error("Please fix the form errors before proceeding.");
      return;
    }

    // BUG FIX: the old code inspected a 'server'-type email error AFTER
    // form.trigger() had already re-run the zod schema and wiped it, so a
    // duplicate email always slipped past step 1 and was only caught at final
    // submit. Re-verify availability at the gate before advancing from step 1.
    if (step === 0) {
      const email = form.getValues("email");
      try {
        const res = await checkEmail(email);
        if (!res.success) {
          form.setError("email", { type: "server", message: res.message });
          toast.error(res.message || "Email is already registered");
          return;
        }
      } catch (err) {
        if (err.response?.status === 409) {
          const msg = err.response.data?.message || "Email is already registered";
          form.setError("email", { type: "server", message: msg });
          toast.error(msg);
          return;
        }
        // Network/other error: let them proceed; the backend still enforces
        // uniqueness on final submit.
      }
    }

    setStep((currentStep) => currentStep + 1);
  };

  const onBack = () => {
    setStep((currentStep) => Math.max(0, currentStep - 1));
  };

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const { confirmPassword, ...raw } = form.getValues();
    const payload = sanitizeFields(raw, ["firstName", "lastName", "registerId"]);

    try {
      const data = await register(payload);

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);
      await sleep(2000);
      navigate("/login");
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Registration Failed! Server error.";
      toast.error(errorMessage);
    }
  };

  return {
    step,
    form,
    onNext,
    onBack,
    onSubmit,
    isLastStep: step === allSchemas.length - 1,
  };
};
