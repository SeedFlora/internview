const hasValue = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0;

const getByPath = (obj, path) =>
  path.split(".").reduce((current, key) => (current == null ? undefined : current[key]), obj);

const getFirstByPaths = (obj, paths) => {
  for (const path of paths) {
    const value = getByPath(obj, path);
    if (hasValue(value)) return value;
  }
  return null;
};

const getAllByPaths = (obj, paths) => {
  const values = paths
    .map((path) => getByPath(obj, path))
    .filter(hasValue)
    .map((value) => String(value));
  return Array.from(new Set(values));
};

// Contract from GET /review/:companySlug
const REVIEW_ID_PATHS = ["internshipDetailId", "internshipHeaderId"];

const PROCESS_ID_PATHS = [
  "internshipDetailId",
  "id",
  "detailId",
  "internshipHeaderId",
  "headerId",
  "reviewId",
  "reviewID",
  "review_id",
  "internshipDetail.internshipDetailId",
  "internshipDetail.id",
  "internshipDetail.internshipHeaderId",
  "internshipHeader.internshipHeaderId",
  "internshipHeader.id",
];

export const getReviewIdentifier = (item) => getFirstByPaths(item, REVIEW_ID_PATHS);

export const collectReviewIdentifiers = (item) => getAllByPaths(item, REVIEW_ID_PATHS);

export const getProcessIdentifier = (item) => getFirstByPaths(item, PROCESS_ID_PATHS);
