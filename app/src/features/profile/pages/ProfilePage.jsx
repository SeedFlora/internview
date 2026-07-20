import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/userContext";
import { useNavigate } from "react-router-dom";
import { SkeletonCircle, SkeletonLine } from "@/components/ui/skeleton";
import { getMyReviews, getSavedCompanies, getMyCertificates } from "@/api/userApi";
import { getRecentReviews } from "@/api/reviewApi";
import { unsaveCompany } from "@/api/companyApi";
import { toast } from "sonner";
import { CertificateSubmit } from "@/features/profile/components/CertificateSubmit";
import { EditProfileModal } from "@/features/profile/components/EditProfileModal";
import { PersonalInformationCard } from "../components/PersonalInformationCard";
import { AcademicDetailsCard } from "../components/AcademicDetailsCard";
import { CampusLocationCard } from "../components/CampusLocationCard";
import { CertificateCard } from "../components/CertificateCard";
import { RecentReviewsCard } from "../components/RecentReviewsCard";
import { SavedCompaniesCard } from "../components/SavedCompaniesCard";
import { normalizeErrorMessage } from "@/helpers/apiUtils";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  
  // Check common wrapper keys  
  const keys = ["items", "result", "content", "data", "payload", "reviews", "list", "rows", "records"];
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  
  return [];
};

const parseFlexibleResponse = (response) => {
  if (!response) {
    return { success: false, message: "No response", data: null };
  }

  const { success, message } = response;

  if (success === undefined || success === null) {
    return { success: false, message: "Invalid response format", data: null };
  }

  if (!success) {
    return { success: false, message: message || "Request failed", data: null };
  }

  // Try multiple wrapper patterns
  let data = null;
  
  // Direct fields
  if (Array.isArray(response.result)) data = response.result;
  else if (Array.isArray(response.data)) data = response.data;
  else if (Array.isArray(response.items)) data = response.items;
  else if (Array.isArray(response.payload)) data = response.payload;
  else if (Array.isArray(response.reviews)) data = response.reviews;
  else if (Array.isArray(response.list)) data = response.list;
  else if (Array.isArray(response.rows)) data = response.rows;
  else if (Array.isArray(response.records)) data = response.records;
  else if (Array.isArray(response.content)) data = response.content;
  
  // Nested one-level deep (e.g., response.data.result, response.result.items)
  if (!data) {
    for (const wrapper of ["data", "result", "payload"]) {
      if (response[wrapper] && typeof response[wrapper] === "object") {
        for (const inner of ["items", "result", "content", "reviews", "list", "rows", "records"]) {
          if (Array.isArray(response[wrapper][inner])) {
            data = response[wrapper][inner];
            break;
          }
        }
        if (data) break;
      }
    }
  }

  return {
    success: true,
    message: message || "Success",
    data: data || null,
  };
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const getReviewAuthorName = (review) =>
  review?.createdBy ?? review?.createdByName ?? review?.authorName ?? review?.name ?? "";

const getUserMatchers = (user) => {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const values = [
    user?.name,
    user?.fullName,
    fullName,
    user?.firstName,
    user?.lastName,
    user?.username,
    user?.email,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  return new Set(values);
};

const filterReviewsForUser = (reviews, user) => {
  const matchers = getUserMatchers(user);
  if (!matchers.size) return [];

  return reviews.filter((review) => {
    const author = normalizeText(getReviewAuthorName(review));
    return matchers.has(author);
  });
};

const getCompanySlug = (company) =>
  company?.companySlug ?? company?.slug ?? company?.company?.companySlug;

export function ProfilePage() {
  // Get user info and loading state from UserContext
  const { user, loading, loadUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [recentReviews, setRecentReviews] = useState([]);
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [savedError, setSavedError] = useState(null);
  const [unsaveLoadingSlug, setUnsaveLoadingSlug] = useState(null);
  
  const fetchCertificates = async () => {
    setCertificatesLoading(true);
    try {
      const response = await getMyCertificates();
      setCertificates(response?.result || []);
    } catch {
      setCertificates([]);
    } finally {
      setCertificatesLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchCertificates();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchProfileHistories = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      setSavedError(null);
      setRecentReviews([]);

      try {
        const [reviewsResult, savedResult] = await Promise.allSettled([
          getMyReviews(),
          getSavedCompanies(),
        ]);

        let resolvedReviews = [];

        if (reviewsResult.status === "fulfilled") {
          const parsedReviews = parseFlexibleResponse(reviewsResult.value);
          if (parsedReviews.success) {
            resolvedReviews = normalizeList(parsedReviews.data);
          } else if (parsedReviews.message && !parsedReviews.message.includes("GET /user/my-reviews")) {
            setHistoryError(parsedReviews.message || "Gagal memuat riwayat review");
          }
        } else {
          const reviewsMessage = normalizeErrorMessage(
            reviewsResult.reason,
            "Gagal memuat riwayat review"
          );
          if (!reviewsMessage.includes("GET /user/my-reviews")) {
            setHistoryError(reviewsMessage);
          }
        }

        if (resolvedReviews.length === 0) {
          try {
            const fallbackResponse = await getRecentReviews({ limit: 200 });
            const parsedFallback = parseFlexibleResponse(fallbackResponse);

            if (parsedFallback.success) {
              resolvedReviews = filterReviewsForUser(
                normalizeList(parsedFallback.data),
                user
              );
            }
          } catch {
            // Keep empty state if the fallback source also fails.
          }
        }

        setRecentReviews(resolvedReviews);

        if (savedResult.status === "fulfilled") {
          const parsedSaved = parseFlexibleResponse(savedResult.value);
          if (!parsedSaved.success) {
            setSavedError(parsedSaved.message || "Gagal memuat perusahaan tersimpan");
          } else {
            setSavedCompanies(normalizeList(parsedSaved.data));
          }
        } else {
          setSavedError(
            normalizeErrorMessage(savedResult.reason, "Gagal memuat perusahaan tersimpan")
          );
        }
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchProfileHistories();
  }, [user]);

  const handleUnsaveFromProfile = async (company) => {
    const companySlug = getCompanySlug(company);

    if (!companySlug) {
      toast.error("Slug company tidak ditemukan untuk proses unsave");
      return;
    }

    setUnsaveLoadingSlug(companySlug);
    try {
      const response = await unsaveCompany(companySlug);
      const { success, message } = parseFlexibleResponse(response);

      if (!success) {
        toast.error(message || "Gagal menghapus simpanan company");
        return;
      }

      setSavedCompanies((prev) => prev.filter((item) => getCompanySlug(item) !== companySlug));
      toast.success("Company berhasil dihapus dari simpanan");
    } catch (error) {
      toast.error(normalizeErrorMessage(error, "Gagal menghapus simpanan company"));
    } finally {
      setUnsaveLoadingSlug(null);
    }
  };
  
  // Protect route: redirect to login if not authenticated
  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  // Show animated skeleton while fetching user data
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <SkeletonCircle size={80} className="shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonLine height="h-6" width="w-1/3" />
              <SkeletonLine height="h-4" width="w-1/4" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-3">
            <SkeletonLine height="h-40" />
          </div>
          <SkeletonLine height="h-24" />
          <SkeletonLine height="h-24" />
          <div className="lg:col-span-3">
            <SkeletonLine height="h-28" />
          </div>
        </div>
      </div>
    );
  }

  // Main profile page with three sections: header, personal info, academic info, campus location
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <CertificateSubmit user={user} onCertificateSubmitted={fetchCertificates} />

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onSaved={() => loadUser?.(true)}
      />

      {/* ===== PROFILE INFORMATION CARDS ===== */}
      <div>
        <div className="grid gap-5 lg:grid-cols-3">
          <PersonalInformationCard user={user} onEdit={() => setIsEditOpen(true)} />
          <AcademicDetailsCard user={user} />
          <CampusLocationCard user={user} />
          <CertificateCard certificates={certificates} loading={certificatesLoading} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <RecentReviewsCard
          reviews={recentReviews}
          loading={historyLoading}
          error={historyError}
        />
        <SavedCompaniesCard
          companies={savedCompanies}
          loading={historyLoading}
          error={savedError}
          onUnsave={handleUnsaveFromProfile}
          unsaveLoadingSlug={unsaveLoadingSlug}
        />
      </div>

    </div>
  );
}