const pickString = (...values) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();

export const humanizeSlug = (slug) =>
  String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

export const getCompanyDisplayName = (item, fallback = "Perusahaan") =>
  pickString(
    item?.companyName,
    item?.company?.companyName,
    item?.company?.name,
    item?.internshipHeader?.company?.companyName,
    item?.internshipHeader?.companyName,
    item?.internshipDetail?.company?.companyName
  ) || fallback;

export const getAuthorDisplayName = (item, fallback = "Anonim") =>
  pickString(item?.createdByName, item?.createdBy, item?.authorName, item?.name) || fallback;

export const getJobTitleDisplay = (item, fallback = "Intern") =>
  pickString(item?.jobTitle, item?.role, item?.position) || fallback;
