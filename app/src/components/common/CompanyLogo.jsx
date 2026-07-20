import { Skeleton } from "@/components/ui/skeleton";
import { useLogoValidation } from "@/features/companies/hooks/useLogoValidation";

export function CompanyLogo({
  website,
  companyName,
  companyAbbreviation,
  className = "",
  imgClassName = "max-w-full max-h-full object-contain",
  fallbackClassName = "",
  showSkeleton = false,
}) {
  const { logoUrl, logoValid } = useLogoValidation(website);
  const initial = companyAbbreviation?.charAt(0) || companyName?.charAt(0) || "?";

  if (showSkeleton && logoValid === null) {
    return (
      <div className={className}>
        <Skeleton className="h-full w-full rounded" />
      </div>
    );
  }

  return (
    <div className={className}>
      {logoValid ? (
        <img
          src={logoUrl}
          alt={companyName}
          loading="lazy"
          className={imgClassName}
        />
      ) : (
        <div className={`h-full w-full flex items-center justify-center ${fallbackClassName}`}>
          {initial}
        </div>
      )}
    </div>
  );
}
