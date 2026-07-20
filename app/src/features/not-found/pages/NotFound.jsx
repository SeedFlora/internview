import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-inter text-sm font-semibold tracking-widest uppercase text-slate-400 mb-4">
          404 Error
        </p>
        <h1 className="font-plus-jakarta text-[52px] font-bold leading-[1.1] tracking-[-0.02em] text-slate-900 mb-4">
          Halaman tidak ditemukan
        </h1>
        <p className="font-inter text-[16px] leading-[1.65] text-slate-500 mb-8">
          Sepertinya kamu tersesat. Coba kembali ke beranda atau ulangi langkahmu.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={() => navigate("/")}>
            Kembali ke Beranda
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Halaman Sebelumnya
          </Button>
        </div>
      </div>
    </div>
  );
}