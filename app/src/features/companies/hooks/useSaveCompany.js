import { useEffect, useState } from "react";
import { toast } from "sonner";
import { saveCompany } from "@/api/companyApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";

export const useSaveCompany = ({ companySlug, initialIsSaved = false }) => {
  const [isSaved, setIsSaved] = useState(Boolean(initialIsSaved));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsSaved(Boolean(initialIsSaved));
  }, [companySlug, initialIsSaved]);

  const toggleSave = async () => {
    if (!companySlug || saving) return false;

    const previousState = isSaved;
    const nextState = !previousState;

    setSaving(true);
    setIsSaved(nextState);

    try {
      const response = await saveCompany(companySlug, nextState);

      const { success, message, data } = handleApiResponse(response);

      if (!success) {
        setIsSaved(previousState);
        toast.error(message || "Failed to update the company save status.");
        return false;
      }

      if (typeof data?.isSaved === "boolean") {
        setIsSaved(data.isSaved);
      }

      toast.success(nextState ? "Company saved" : "Company removed from saved list");
      return true;
    } catch (error) {
      setIsSaved(previousState);
      toast.error(
        normalizeErrorMessage(error, "Failed to update the company save status.")
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { isSaved, saving, toggleSave };
};
