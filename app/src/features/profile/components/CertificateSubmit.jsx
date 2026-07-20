import { useState } from "react";
import { toast } from "sonner";
import { submitCertificate } from "@/api/userApi";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ProfileHeader } from "./ProfileHeader";
import { CertificateModal } from "./CertificateModal";

export function CertificateSubmit({ user, onCertificateSubmitted }) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    selectedFile,
    fileName,
    setFileName,
    requestingUrl,
    uploading,
    compressing,
    handleFileChange,
    handleUpload,
    reset: resetFileUpload,
  } = useFileUpload();

  const handleClose = () => {
    setIsOpen(false);
    resetFileUpload();
  };

  const handleSubmit = async (data, resetForm) => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      const uploadResult = await handleUpload();

      if (!uploadResult) return;

      const certificateData = {
        issuer: data.issuerId,
        certificateUrl: uploadResult.presignedResponse.result.fileName,
        certificateName: data.certificateName,
        fileSize: selectedFile?.size || 0,
      };

      const submitResponse = await submitCertificate(certificateData);

      if (submitResponse) {
        console.info("Certificate submitted successfully:", submitResponse);
        toast.success("Certificate submitted successfully");
        onCertificateSubmitted?.();
        resetForm();
        resetFileUpload();
        setIsOpen(false);
      } else {
        toast.error(submitResponse.data.message || "Failed to submit certificate");
      }
    } catch (error) {
      toast.error("An error occurred while submitting certificate");
      console.error(error);
    }
  };

  return (
    <>
      <ProfileHeader user={user} onSubmitCertificate={() => setIsOpen(true)} />
      <CertificateModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        selectedFile={selectedFile}
        fileName={fileName}
        setFileName={setFileName}
        handleFileChange={handleFileChange}
        compressing={compressing}
        requestingUrl={requestingUrl}
        uploading={uploading}
      />
    </>
  );
}
