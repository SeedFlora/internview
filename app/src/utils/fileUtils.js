export const validateFile = (file, allowedTypes = ["application/pdf"], maxSize = 10 * 1024 * 1024) => {
  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    const typeNames = allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
    return { isValid: false, errorMessage: `Hanya file ${typeNames} yang diperbolehkan` };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { isValid: false, errorMessage: `Ukuran file maksimal ${maxSizeMB}MB` };
  }

  return { isValid: true, errorMessage: "" };
};


export const compressImage = async (file) => {
  try {
    const { default: imageCompression } = await import(
      "browser-image-compression"
    );

    const options = {
      maxSizeMB: 1, // Compress to under 1MB if possible
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);

    // Check compressed size (3MB limit for images)
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (compressedFile.size > maxSize) {
      return { compressedFile: null, error: "File setelah kompresi masih melebihi 3MB" };
    }

    return { compressedFile, error: null };
  } catch (error) {
    console.error("Compression error:", error);
    return { compressedFile: null, error: "Gagal mengompresi file" };
  }
};