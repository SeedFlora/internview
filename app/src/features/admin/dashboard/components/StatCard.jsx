export function StatCard({ label, value, icon: Icon, iconBg, iconColor, loading }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-lg p-2.5 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value ?? "-"}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
