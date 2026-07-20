import { useState, useEffect } from "react";

/**
 * Custom hook untuk validasi dan loading logo dari website favicon
 * @param {string} website - Domain website perusahaan
 * @returns {Object} - { logoUrl, logoValid }
 */
export const useLogoValidation = (website) => {
  const [logoValid, setLogoValid] = useState(null);

  const logoUrl = website
    ? `https://www.google.com/s2/favicons?domain=${website}&sz=256`
    : null;

  useEffect(() => {
    if (!logoUrl) {
      setLogoValid(false);
      return;
    }

    const img = new Image();

    img.onload = () => {
      // Favicon dari Google API minimal 16x16, jika kurang berarti default
      setLogoValid(img.naturalWidth > 16);
    };

    img.onerror = () => setLogoValid(false);

    img.src = logoUrl;
  }, [logoUrl]);

  return { logoUrl, logoValid };
};
