import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BackButton } from "@/components/common/BackButton";
import { RecruitmentProcessCard } from "@/features/companies/components/cards/RecruitmentProcessCard";
import { getCompanyRecruitmentDetail, getCompanyRecruitmentProcess } from "@/api/reviewApi";
import { getCompanyBySlug } from "@/api/companyApi";
import { handleApiResponse, normalizeErrorMessage } from "@/helpers/apiUtils";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import {
  getAuthorDisplayName,
  getCompanyDisplayName,
  getJobTitleDisplay,
  humanizeSlug,
} from "../utils/reviewDisplayUtils";
import { getProcessIdentifier } from "../utils/reviewIdUtils";

const getDifficultyLabel = (item) => {
  const raw = item?.interviewDifficulty;
  if (typeof raw === "number") {
    if (raw <= 2) return "Mudah";
    if (raw === 3) return "Sedang";
    return "Sulit";   
  }
  return (
    item?.difficultyLabel?.trim?.() ||
    item?.difficulty?.trim?.() ||
    item?.interviewDifficultyLabel?.trim?.() ||
    "-"
  );
};

const getSnippet = (item) =>
  item?.selectionProcess?.trim?.() ||
  item?.tipsTricks?.trim?.() ||
  item?.exampleQuestions?.trim?.() ||
  item?.testimony?.trim?.() ||
  "-";

const toItems = (data) => (Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
const toProcessItem = (data) =>
  data?.process ?? data?.item ?? data?.detail ?? data?.internshipDetail ?? data ?? null;

const MoreProcessCard = ({ item, companySlug }) => {
  const processId = getProcessIdentifier(item);
  if (!processId) return null;

  const authorName = getAuthorDisplayName(item);
  const jobTitle = getJobTitleDisplay(item);

  return (
    <Link
      to={`/company/${companySlug}/recruitment/${processId}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(
              authorName
            )}`}
          >
            {getInitials(authorName)}
          </div>
          <div>
            <p className="font-plus-jakarta text-sm font-semibold text-slate-900">{authorName}</p>
            <p className="font-inter text-xs text-slate-500">{jobTitle}</p>
          </div>
        </div>

        <span className="rounded-full bg-orange-50 px-2 py-1 font-inter text-xs font-semibold text-orange-600">
         {getDifficultyLabel(item)}
        </span>
      </div>

      <p className="font-inter line-clamp-3 text-sm leading-relaxed text-slate-700">{getSnippet(item)}</p>
    </Link>
  );
};

export const RecruitmentProcessDetailPage = () => {
  const { companySlug, internshipDetailId } = useParams();
  const [processItem, setProcessItem] = useState(null);
  const [companyProcesses, setCompanyProcesses] = useState([]);
  const [companyNameFromSlug, setCompanyNameFromSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companySlug) return;

    let isMounted = true;

    const fetchCompanyName = async () => {
      try {
        const response = await getCompanyBySlug(companySlug);
        const { success, data } = handleApiResponse(response);
        if (!success || !isMounted) return;

        const companyName = data?.companyName ?? data?.name ?? data?.company?.companyName ?? "";
        if (companyName) {
          setCompanyNameFromSlug(companyName);
        }
      } catch {
        // Keep fallback from slug formatting when company API fails.
      }
    };

    fetchCompanyName();
    return () => {
      isMounted = false;
    };
  }, [companySlug]);

  useEffect(() => {
    if (!internshipDetailId) return;

    const fetchProcessDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const [detailResponse, listResponse] = await Promise.all([
          getCompanyRecruitmentDetail(companySlug, internshipDetailId),
          getCompanyRecruitmentProcess(companySlug, { limit: 15 }),
        ]);

        const { success: detailSuccess, message: detailMessage, data: detailData } =
          handleApiResponse(detailResponse);
        const { success: listSuccess, data: listData } = handleApiResponse(listResponse);

        if (!detailSuccess) {
          setError(detailMessage || "Gagal memuat detail recruitment process");
          return;
        }

        const detailItem = toProcessItem(detailData);
        const list = listSuccess ? toItems(listData) : [];
        const fallbackItem = list.find(
          (item) => String(getProcessIdentifier(item)) === String(internshipDetailId)
        );

        setProcessItem(detailItem ?? fallbackItem ?? null);
        setCompanyProcesses(list);
      } catch (err) {
        setError(normalizeErrorMessage(err, "Gagal memuat detail recruitment process"));
      } finally {
        setLoading(false);
      }
    };

    fetchProcessDetail();
  }, [companySlug, internshipDetailId]);

  const companyName = useMemo(() => {
    const fromProcess = getCompanyDisplayName(processItem);
    if (fromProcess && fromProcess !== "Perusahaan") return fromProcess;
    if (companyNameFromSlug) return companyNameFromSlug;
    return humanizeSlug(companySlug) || "Perusahaan";
  }, [processItem, companyNameFromSlug, companySlug]);

  const moreProcesses = useMemo(() => {
    if (!processItem) return [];

    const activeId = String(getProcessIdentifier(processItem));
    return companyProcesses
      .filter((item) => String(getProcessIdentifier(item)) !== activeId)
      .filter((item) => Boolean(getProcessIdentifier(item)))
      .slice(0, 2);
  }, [companyProcesses, processItem]);

  return (
    <div className="bg-slate-50/70 py-8 md:py-10">
      <Container className="max-w-5xl">
        <div className="mb-4">
          <BackButton variant="default" label="Back" />
        </div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="font-plus-jakarta text-xl font-bold text-slate-900 md:text-2xl">
            Recruitment Process Detail of{" "}
            <Link
              to={`/company/${companySlug}`}
              className="text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:text-orange-600"
            >
              {companyName}
            </Link>
          </h1>
        </div>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        )}

        {!loading && error && <ErrorMessage message={error} />}
        {!loading && !error && !processItem && (
          <ErrorMessage message="Recruitment process tidak ditemukan." />
        )}

        {!loading && !error && processItem && (
          <>
            <RecruitmentProcessCard data={processItem} companySlug={companySlug} />

            {moreProcesses.length > 0 && (
              <section className="mt-8 space-y-4">
                <h2 className="font-plus-jakarta text-xl font-bold text-slate-900 md:text-2xl">
                  More Recruitment Processes from {companyName}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {moreProcesses.map((item, index) => (
                    <MoreProcessCard
                      key={getProcessIdentifier(item) ?? index}
                      item={item}
                      companySlug={companySlug}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </Container>
    </div>
  );
};
