import { axiosInstance } from "./axiosInstance";

export const getPresignedUrl = async (fileName, extension) => {
  const response = await axiosInstance.get("/minio/upload-url", {
    params: { fileName, extension },
  });
  return response.data;
};

export const uploadFileToPresignedUrl = async (uploadUrl, file) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  // Fetch API doesn't throw on non-2xx status, so we check manually
  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = "Upload failed";
    try {
      const errorBody = await response.text();
      errorMessage = errorBody || `Upload failed with status ${response.status}`;
    } catch (err) {
      // Ignore error parsing, use default message
    }
    throw new Error(errorMessage);
  }

  return {
    success: true,
    message: "File uploaded successfully",
    status: response.status,
  };
};