import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isRequiredString, isRequiredNumber } from "@/helpers/validations";
import { sanitizeFields } from "@/helpers/sanitize";

const reviewSchema = z.object({
  internshipType: isRequiredString(1),
  workScheme: isRequiredString(1),
  duration: isRequiredString(1),
  year: z.string().regex(/^\d{4}$/, "Format harus YYYY (contoh: 2024)"),
  jobTitle: isRequiredString(1),
  category: z.coerce.number().min(1, "Wajib dipilih"),
  SubCategoryIds: z.array(z.number()).min(1, "Pilih minimal 1 sub kategori"),
  ratings: z.object({
    workCulture: isRequiredNumber(1),
    learningOpp: isRequiredNumber(1),
    mentorship: isRequiredNumber(1),
    benefit: isRequiredNumber(1),
    workLifeBalance: isRequiredNumber(1),
  }),
  testimony: isRequiredString(1),
  pros: isRequiredString(1),
  cons: isRequiredString(1),
  admissionTrack: isRequiredString(1),
  recruitmentSteps: z.array(z.number()).min(1, "Pilih minimal 1 tahapan"),
  recruitmentDurationCode: isRequiredString(1),
  interviewDifficulty: isRequiredNumber(1),
  exampleQuestions: isRequiredString(1),
  selectionProcess: isRequiredString(1),
  tipsTricks: isRequiredString(1),
  honestyStatement: z.boolean().refine((val) => val === true, "Wajib setuju dengan Pernyataan Kejujuran"),
});

const SANITIZED_FIELDS = ["jobTitle", "testimony", "pros", "cons", "exampleQuestions", "selectionProcess", "tipsTricks"];

const STEP_KEYS = [
  ["internshipType", "workScheme", "duration", "year", "jobTitle", "category", "SubCategoryIds"],
  ["ratings", "testimony", "pros", "cons"],
  ["admissionTrack", "recruitmentSteps", "recruitmentDurationCode", "interviewDifficulty", "exampleQuestions", "selectionProcess", "tipsTricks"],
  ["honestyStatement"],
];

export const useReviewWizard = (onFinalSubmit) => {
  const [step, setStep] = useState(0);
  const [highestReachedStep, setHighestReachedStep] = useState(1);

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      internshipType: "",
      workScheme: "",
      duration: "",
      year: "",
      jobTitle: "",
      category: "",
      SubCategoryIds: [],
      ratings: {
        workCulture: 0,
        learningOpp: 0,
        mentorship: 0,
        benefit: 0,
        workLifeBalance: 0,
      },
      testimony: "",
      pros: "",
      cons: "",
      admissionTrack: "",
      recruitmentSteps: [],
      recruitmentDurationCode: "",
      interviewDifficulty: 0,
      exampleQuestions: "",
      selectionProcess: "",
      tipsTricks: "",
      honestyStatement: false,
    },
    mode: "onTouched",
  });

  const onNext = async () => {
    const keys = STEP_KEYS[step];
    if (!keys) {
      setStep((s) => {
        const nextStep = s + 1;
        setHighestReachedStep((currentHighest) => Math.max(currentHighest, nextStep + 1));
        return nextStep;
      });
      return;
    }
    const isValid = await form.trigger(keys);
    if (isValid) {
      setStep((s) => {
        const nextStep = Math.min(s + 1, 3);
        setHighestReachedStep((currentHighest) => Math.max(currentHighest, nextStep + 1));
        return nextStep;
      });
      return;
    }

    toast.error("Lengkapi semua field wajib di langkah ini sebelum lanjut.");
  };

  const onBack = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (nextStep) => {
    if (nextStep < 1 || nextStep > highestReachedStep) return;
    setStep(nextStep - 1);
  };

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    const { category, ...rest } = form.getValues();
    const payload = sanitizeFields(
      {
        ...rest,
        duration: parseInt(rest.duration) || 0,
        year: Number(rest.year) || 0,
        recruitmentDurationCode: Number(rest.recruitmentDurationCode) || 0,
      },
      SANITIZED_FIELDS
    );
    await onFinalSubmit(payload);
  };

  return {
    step,
    form,
    onNext,
    onBack,
    onSubmit,
    goToStep,
    highestReachedStep,
    isLastStep: step === 3,
  };
};
