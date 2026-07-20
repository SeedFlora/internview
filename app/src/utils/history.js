let navigateFunction = null;

/**
 * Menerima dan menyimpan fungsi navigate dari hook useNavigate.
 * Dipanggil di komponen root React.
 * @param {function} navigator - Fungsi navigate dari useNavigate
 */
export const setNavigator = (navigator) => {
  navigateFunction = navigator;
};

/**
 * Fungsi untuk navigasi yang dapat dipanggil dari luar komponen React (misalnya Interceptor).
 * @param {string} path - Path URL tujuan (misalnya '/login')
 */
export const appNavigator = (path) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback jika inisialisasi gagal atau jika dipanggil terlalu cepat
    console.warn("Navigator not initialized, using window.location.href");
    window.location.href = path; 
  }
};