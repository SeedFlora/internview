import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const VARIANTS = {
  ghost: "inline-flex items-center gap-2 p-2 hover:bg-white/20 rounded-lg transition text-white",
  default: "flex items-center gap-2 text-slate-600 hover:text-slate-900 transition",
};

export function BackButton({ variant = "ghost", className = "", label }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`${VARIANTS[variant]} ${className}`}
      aria-label="Go back"
    >
      <ChevronLeft className="w-5 h-5" />
      {label && <span>{label}</span>}
    </button>
  );
}
