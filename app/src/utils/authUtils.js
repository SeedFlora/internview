export function clearAuthSession() {
  // Clear all authentication tokens from localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("refreshToken");

  // Clear all cookies by setting expiration to the past
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name) {
      // Clear cookie with different path and domain combinations
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    }
  });
}
