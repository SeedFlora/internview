import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/api/axiosInstance";

export function StorageFilePage() {
  const { "*": filename } = useParams(); // Since route is /storage/*
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await axiosInstance.get(`/storage/${filename}`, {
          responseType: "blob", // Assuming it's a file
        });
        // Handle the file, e.g., create download link or display
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("File tidak ditemukan");
        } else {
          setError("Terjadi kesalahan saat mengakses file");
        }
      } finally {
        setLoading(false);
      }
    };

    if (filename) {
      fetchFile();
    }
  }, [filename]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <div>File downloaded</div>;
}