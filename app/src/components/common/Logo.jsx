export function Logo({ className = "" }) {
  return (
    <div className={`font-bold text-xl tracking-tight flex items-center ${className}`}>
      <span className="text-gray-900 group-hover:text-gray-900 dark:text-white">Intern</span>
      <span className="text-[#F97316]">View</span>
    </div>
  );
}
