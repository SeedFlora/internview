export function CompanyCard({ companyName, companyAbbreviation, website, isPartner }) {
  return (
    <div className="bg-white shadow-sm rounded-xl p-4 text-center hover:shadow-md transition">
      <div className="h-12 flex items-center justify-center mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
          {companyAbbreviation?.charAt(0) || '?'}
        </div>
      </div>
      <h3 className="font-medium">{companyName}</h3>
      <p className="text-sm text-gray-500">{companyAbbreviation || 'N/A'}</p>
      {website && (
        <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline">
          {website}
        </a>
      )}
      {isPartner && <div className="text-green-500 text-xs mt-1">Partner</div>}
      <div className="text-[#F97316] mt-2">★★★★★</div>
    </div>
  );
}
