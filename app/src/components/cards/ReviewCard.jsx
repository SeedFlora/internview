export function ReviewCard({ name, company, role, review }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-gray-500 mb-1">{name}</p>
      <h3 className="font-semibold text-lg">{company}</h3>
      <p className="text-gray-700">{role}</p>
      <div className="text-[#F97316] mt-2 mb-3">★★★★★</div>
      <p className="text-gray-600">{review}</p>
    </div>
  );
}
