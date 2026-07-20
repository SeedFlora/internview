import { useState, useCallback } from "react";

/**
 * Custom hook untuk manage multi-step form state
 * Tracks current step, form data, dan navigation antara steps
 *
 * @param {number} totalSteps - Total number of steps
 * @param {Object} initialData - Initial form data
 * @param {function} onSubmit - Callback function saat submit
 * @returns {Object} - { currentStep, formData, goToNextStep, goToPrevStep, updateFormData, canGoBack, canGoForward }
 */
export const useMultiStepForm = (totalSteps = 4, initialData = {}, onSubmit) => {
  // Default initial data with all section fields
  const defaultInitialData = {
    // Section 1: Informasi Magang
    internshipType: "",
    workScheme: "",
    duration: "",
    year: "",
    position: "",

    // Section 2: Ratings (5 categories)
    ratings: {
      workCulture: 0,
      learningOpp: 0,
      mentorship: 0,
      benefit: 0,
      workLifeBalance: 0,
    },

    // Section 3: Pengalaman & Recruitment
    recruitmentProcess: [],
    interviewDifficulty: 0,
    testimony: "",
    durationStatement: "",
    weaknesses: "",

    ...initialData,
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultInitialData);

  // Update form data for current step
  const updateFormData = useCallback((newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  // Go to next step
  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const nextStep = Math.min(prev + 1, totalSteps);
      return nextStep;
    });
  }, [totalSteps]);

  // Go to previous step
  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Go to specific step
  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  // Check if can go forward
  const canGoForward = currentStep < totalSteps;

  // Check if can go back
  const canGoBack = currentStep > 1;

  // Handle final submit
  const handleSubmit = useCallback(() => {
    if (currentStep === totalSteps && onSubmit) {
      onSubmit(formData);
    }
  }, [currentStep, totalSteps, formData, onSubmit]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setFormData(defaultInitialData);
  }, [defaultInitialData]);

  return {
    currentStep,
    formData,
    updateFormData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    canGoForward,
    canGoBack,
    handleSubmit,
    resetForm,
    totalSteps,
  };
};
