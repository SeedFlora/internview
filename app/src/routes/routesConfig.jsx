import React, { lazy } from "react";

import { RequireAdmin } from "@/components/common/RequireAdmin";
import { AdminLayout } from "@/features/admin/layout/AdminLayout";

import { HomePage } from "@/features/home/pages/HomePage";
import { LoginPage } from "@/features/auth/login/pages/LoginPage";
import { RegisterPage } from "@/features/auth/register/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/forgot-password/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/reset-password/pages/ResetPasswordPage";
import { NotFound } from "@/features/not-found/pages/NotFound";

// ==========================
// Lazy Pages
// ==========================

const ProfilePage = lazy(() =>
  import("@/features/profile/pages/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  }))
);

const InboxDetailPage = lazy(() =>
  import("@/features/inbox/pages/InboxDetailPage").then((m) => ({
    default: m.InboxDetailPage,
  }))
);

const StorageFilePage = lazy(() =>
  import("@/features/storage/pages/StorageFilePage").then((m) => ({
    default: m.StorageFilePage,
  }))
);

const CategoriesPage = lazy(() =>
  import("@/features/categories").then((m) => ({
    default: m.CategoriesPage,
  }))
);

const SubCategoryCompaniesPage = lazy(() =>
  import("@/features/categories").then((m) => ({
    default: m.SubCategoryCompaniesPage,
  }))
);

const CompaniesPage = lazy(() =>
  import("@/features/companies/pages/CompaniesPage").then((m) => ({
    default: m.CompaniesPage,
  }))
);

const CompanyDetailPage = lazy(() =>
  import("@/features/companies/pages/CompanyDetailPage").then((m) => ({
    default: m.CompanyDetailPage,
  }))
);

const CompareLandingPage = lazy(() =>
  import("@/features/companies/pages/CompareLandingPage").then((m) => ({
    default: m.CompareLandingPage,
  }))
);

const CompareCompaniesPage = lazy(() =>
  import("@/features/companies/pages/CompareCompaniesPage").then((m) => ({
    default: m.CompareCompaniesPage,
  }))
);

const AddCompanyPage = lazy(() =>
  import("@/features/companies/pages/AddCompanyPage").then((m) => ({
    default: m.AddCompanyPage,
  }))
);

const ReviewsPage = lazy(() =>
  import("@/features/reviews").then((m) => ({
    default: m.ReviewsPage,
  }))
);

const ReviewWritePage = lazy(() =>
  import("@/features/reviews").then((m) => ({
    default: m.ReviewWritePage,
  }))
);

const ReviewDetailPage = lazy(() =>
  import("@/features/reviews").then((m) => ({
    default: m.ReviewDetailPage,
  }))
);

const ReviewerReviewsDetailPage = lazy(() =>
  import("@/features/reviews").then((m) => ({
    default: m.ReviewerReviewsDetailPage,
  }))
);

const RecruitmentProcessDetailPage = lazy(() =>
  import("@/features/reviews").then((m) => ({
    default: m.RecruitmentProcessDetailPage,
  }))
);

const ContactUsPage = lazy(() =>
  import("@/features/help").then((m) => ({
    default: m.ContactUsPage,
  }))
);

const FaqPage = lazy(() =>
  import("@/features/help").then((m) => ({
    default: m.FaqPage,
  }))
);

const MinioUploadTestPage = lazy(() =>
  import("@/features/minio/pages/MinioUploadTestPage").then((m) => ({
    default: m.MinioUploadTestPage,
  }))
);


const DashboardPage = lazy(() =>
  import("@/features/admin/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);

const CompanyVerificationPage = lazy(() =>
  import("@/features/admin/company-verification/pages/CompanyVerificationPage").then((m) => ({
    default: m.CompanyVerificationPage,
  }))
);

const CertificateVerificationPage = lazy(() =>
  import("@/features/admin/certificate-verification/pages/CertificateVerificationPage").then((m) => ({
    default: m.CertificateVerificationPage,
  }))
);

const UserManagementPage = lazy(() =>
  import("@/features/admin/user-management/pages/UserManagementPage").then((m) => ({
    default: m.UserManagementPage,
  }))
);

const MasterDataCompaniesPage = lazy(() =>
  import("@/features/admin/master-data").then((m) => ({
    default: m.MasterDataCompaniesPage,
  }))
);

const MasterDataCategoriesPage = lazy(() =>
  import("@/features/admin/master-data").then((m) => ({
    default: m.MasterDataCategoriesPage,
  }))
);


export const appRoutes = [
  { path: "/", element: <HomePage />, showNavbar: true },
  { path: "/login", element: <LoginPage />, showNavbar: false },
  { path: "/register", element: <RegisterPage />, showNavbar: false },
  { path: "/forgot-password", element: <ForgotPasswordPage />, showNavbar: false },
  { path: "/reset-password", element: <ResetPasswordPage />, showNavbar: false },

  { path: "/profile", element: <ProfilePage />, showNavbar: true },
  { path: "/inbox/:id", element: <InboxDetailPage />, showNavbar: true },

  { path: "/categories", element: <CategoriesPage />, showNavbar: true },
  {
    path: "/subcategory/:subCategoryName/companies",
    element: <SubCategoryCompaniesPage />,
    showNavbar: true,
  },

  { path: "/companies", element: <CompaniesPage />, showNavbar: true },
  { path: "/compare", element: <CompareLandingPage />, showNavbar: true },


  { path: "/faq", element: <FaqPage />, showNavbar: true },
  { path: "/contact", element: <ContactUsPage />, showNavbar: true },

  {
    path: "/reviews/user/:reviewerSlug/:reviewId",
    element: <ReviewerReviewsDetailPage />,
    showNavbar: true,
  },

  { path: "/companies/add", element: <AddCompanyPage />, showNavbar: true },

  {
    path: "/company/:companySlug",
    element: <CompanyDetailPage />,
    showNavbar: true,
  },

  {
    path: "/compare/:leftCompanySlug/:rightCompanySlug",
    element: <CompareCompaniesPage />,
    showNavbar: true,
  },

  {
    path: "/review/:companySlug",
    element: <ReviewWritePage />,
    showNavbar: true,
  },

  {
    path: "/company/:companySlug/review/:reviewId",
    element: <ReviewDetailPage />,
    showNavbar: true,
  },

  {
    path: "/company/:companySlug/recruitment/:internshipDetailId",
    element: <RecruitmentProcessDetailPage />,
    showNavbar: true,
  },

  {
    path: "/test-minio",
    element: <MinioUploadTestPage />,
    showNavbar: true,
  },

  {
    path: "/storage/*",
    element: <StorageFilePage />,
    showNavbar: false,
  },

  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout>
          <DashboardPage />
        </AdminLayout>
      </RequireAdmin>
    ),
    showNavbar: false,
  },

  {
    path: "/admin/company-verification",
    element: (
      <RequireAdmin>
        <AdminLayout>
          <CompanyVerificationPage />
        </AdminLayout>
      </RequireAdmin>
    ),
    showNavbar: false,
  },

  {
    path: "/admin/certificate-verification",
    element: (
      <RequireAdmin>
        <AdminLayout>
          <CertificateVerificationPage />
        </AdminLayout>
      </RequireAdmin>
    ),
    showNavbar: false,
  },

  {
    path: "/admin/master-data/companies",
    element: (
      <RequireAdmin>
        <AdminLayout>
          <MasterDataCompaniesPage />
        </AdminLayout>
      </RequireAdmin>
    ),
    showNavbar: false,
  },

  {
    path: "/admin/master-data/categories",
    element: (
      <RequireAdmin>
        <AdminLayout>
          <MasterDataCategoriesPage />
        </AdminLayout>
      </RequireAdmin>
    ),
    showNavbar: false,
  },

  {
    path: "/admin/user-management",
    element: (
      <RequireAdmin>
        <AdminLayout>
          <UserManagementPage />
        </AdminLayout>
      </RequireAdmin>
    ),
    showNavbar: false,
  },

  { path: "*", element: <NotFound />, showNavbar: false },
];