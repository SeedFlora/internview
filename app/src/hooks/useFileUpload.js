import { useState } from "react";
import { toast } from "sonner";
import { getPresignedUrl, uploadFileToPresignedUrl } from "@/api/minioApi";
import { validateFile, compressImage } from "@/utils/fileUtils";

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [requestingUrl, setRequestingUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [signedPayload, setSignedPayload] = useState(null);
  const [result, setResult] = useState(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [originalSize, setOriginalSize] = useState(0);

  const requestSignedUrl = async (requestedFileName) => {
    setRequestingUrl(true);
    try {
      const extension = requestedFileName.split('.').pop();
      const presignedResponse = await getPresignedUrl(requestedFileName, extension);
      const presignedData = presignedResponse;

      if (!presignedData?.success) {
        setSignedPayload(null);
        setResult({ step: "presigned-url", response: presignedData });
        toast.error(presignedData?.message || "Gagal mendapatkan upload URL");
        return null;
      }

      const uploadUrl =
        presignedData?.result?.uploadUrl ||
        presignedData?.result?.url ||
        presignedData?.result?.signedUrl ||
        presignedData?.data?.uploadUrl ||
        presignedData?.data?.signedUrl ||
        presignedData?.signedUrl ||
        presignedData?.uploadUrl;

      const publicUrl =
        presignedData?.result?.publicUrl ||
        presignedData?.result?.fileUrl ||
        presignedData?.result?.url ||
        presignedData?.data?.publicUrl ||
        presignedData?.data?.fileUrl ||
        presignedData?.publicUrl ||
        presignedData?.fileUrl;

      if (!uploadUrl) {
        const fallbackMessage = "Upload URL tidak ditemukan di response backend";
        setSignedPayload(null);
        setResult({ step: "presigned-url", response: presignedData });
        toast.error(fallbackMessage);
        return null;
      }

      const payload = {
        requestedFileName,
        uploadUrl,
        publicUrl: publicUrl || null,
        presignedResponse: presignedData,
      };

      setSignedPayload(payload);
      setResult({ step: "presigned-url", ...payload });
      toast.success("Signed URL berhasil didapat dari backend");
      return payload;
    } finally {
      setRequestingUrl(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(null);
    setSignedPayload(null);
    setResult(null);
    setOriginalFileName("");
    setOriginalSize(0);

    if (!file) {
      setFileName("");
      return;
    }

    // Validate file
    const validation = validateFile(file, ["application/pdf"]);
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      setFileName("");
      return;
    }

    setOriginalFileName(file.name);
    setOriginalSize(file.size);
    setFileName(file.name);

    // Compress if it's an image
    if (file.type.startsWith("image/")) {
      setCompressing(true);
      const compressionResult = await compressImage(file);
      setCompressing(false);

      if (compressionResult.error) {
        toast.error(compressionResult.error);
        setFileName("");
        return;
      }

      setSelectedFile(compressionResult.compressedFile);
      toast.success("File berhasil dikompresi");
      await requestSignedUrl(compressionResult.compressedFile.name);
    } else {
      setSelectedFile(file);
      await requestSignedUrl(file.name);
    }
  };

  const handleUpload = async () => {
    console.log("useFileUpload: handleUpload called");
    if (!selectedFile) {
      console.log("useFileUpload: No selectedFile");
      toast.error("Pilih dokumen terlebih dahulu");
      return null;
    }

    console.log("useFileUpload: Starting upload for file:", selectedFile.name);
    setUploading(true);

    try {
      const requestedFileName = fileName || selectedFile.name;
      console.log("useFileUpload: requestedFileName:", requestedFileName);

      let activeSignedPayload = signedPayload;
      if (!activeSignedPayload?.uploadUrl || activeSignedPayload?.requestedFileName !== requestedFileName) {
        console.log("useFileUpload: Requesting new signed URL");
        activeSignedPayload = await requestSignedUrl(requestedFileName);
        console.log("useFileUpload: Got signed payload:", activeSignedPayload);
      }

      if (!activeSignedPayload?.uploadUrl) {
        console.log("useFileUpload: No uploadUrl available");
        return null;
      }

      console.log("useFileUpload: Uploading to MinIO...");
      const uploadResponse = await uploadFileToPresignedUrl(activeSignedPayload.uploadUrl, selectedFile);
      const uploadData = uploadResponse;
      console.log("useFileUpload: Upload response:", uploadData);

      const uploadResult = {
        step: "upload",
        requestedFileName,
        uploadUrl: activeSignedPayload.uploadUrl,
        publicUrl: activeSignedPayload.publicUrl,
        presignedResponse: activeSignedPayload.presignedResponse,
        uploadResponse: uploadData,
        originalFileName,
        fileType: selectedFile.type,
        compressedSize: selectedFile.size,
        originalSize,
      };

      setResult(uploadResult);
      console.log("useFileUpload: Upload result created:", uploadResult);

      if (uploadData?.success) {
        console.log("useFileUpload: Upload successful");
        toast.success("Upload dokumen ke MinIO berhasil");
        return uploadResult;
      } else {
        console.log("useFileUpload: Upload failed");
        toast.error(uploadData?.message || "Upload gagal");
        return null;
      }
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setFileName("");
    setSignedPayload(null);
    setResult(null);
    setOriginalFileName("");
    setOriginalSize(0);
  };

  return {
    selectedFile,
    fileName,
    setFileName,
    requestingUrl,
    uploading,
    compressing,
    signedPayload,
    result,
    handleFileChange,
    handleUpload,
    reset,
  };
};