import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#232B38] text-white py-6 sm:py-8 lg:py-9 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-5 md:gap-6 mb-6 sm:mb-8 lg:mb-9">
          <div className="col-span-1 md:col-span-2 pr-0 md:pr-6">
            <h2 className="text-sm sm:text-lg font-bold text-white mb-2 sm:mb-3">
              Intern<span className="text-[#F97316]">View</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-snug max-w-sm">
              Platform ulasan magang untuk mahasiswa BINUS University. Temukan pengalaman magang terbaikmu.
            </p>
          </div>
          
          <div>
            <h3 className="text-white text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Menu</h3>
            <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
              <li><a href="/categories" className="hover:text-white transition">Categories</a></li>
              <li><a href="/companies" className="hover:text-white transition">Companies</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Need Help?</h3>
            <ul className="space-y-2 text-slate-400 text-xs sm:text-sm">
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4 sm:pt-5 text-center text-slate-400 text-[11px] sm:text-xs">
          &copy; 2026 InternView. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
