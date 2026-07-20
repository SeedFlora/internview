/**
 * Container Component
 * ==================
 * Komponen wrapper untuk membatasi lebar konten dengan batas kiri-kanan yang konsisten.
 * 
 * ATURAN PENGGUNAAN:
 * - Gunakan Container untuk membungkus konten (teks, card, form, dll)
 * - Jangan gunakan Container untuk background styling
 * - Background harus tetap full-width di luar Container
 * 
 * @example
 * <section className="bg-gray-50 py-12">
 *   <Container>
 *     <h1>Judul</h1>
 *     <p>Konten</p>
 *   </Container>
 * </section>
 */

export function Container({ children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-6 ${className}`}>
      {children}
    </div>
  );
}
