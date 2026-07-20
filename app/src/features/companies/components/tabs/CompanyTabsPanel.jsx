import React, { useState, useEffect } from "react";
import { InformationTabContent } from "./InformationTabContent";
import { ReviewsTabContent } from "./ReviewsTabContent";
import { RecruitmentTabContent } from "./RecruitmentTabContent";
import { TabNavigation } from "./TabNavigation";
import { COMPANY_DETAIL_TABS } from "../../constants/tabs";
import { getReviewSummary } from "@/api/reviewApi";

export const CompanyTabsPanel = ({ companyId, companySlug, companyName, bio }) => {
  const [activeTab, setActiveTab] = useState("informasi");
  const [visibleTab, setVisibleTab] = useState("informasi");
  const [tabTransition, setTabTransition] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companySlug) return;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getReviewSummary(companySlug);
        if (response.success) {
          setSummaryData(response.result);
        } else {
          setError(response.message || "Failed to load review summary");
        }
      } catch (err) {
        setError(err.message || "Failed to load review summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [companySlug]);

  useEffect(() => {
    if (activeTab === visibleTab) return;

    const fromTab = visibleTab;
    const toTab = activeTab;
    setTabTransition({ from: fromTab, to: toTab, phase: "entering" });

    const animationFrame = window.requestAnimationFrame(() => {
      setTabTransition((current) => {
        if (!current || current.to !== toTab) return current;
        return { ...current, phase: "crossfading" };
      });
    });

    const timeoutId = window.setTimeout(() => {
      setVisibleTab(toTab);
      setTabTransition(null);
    }, 220);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeoutId);
    };
  }, [activeTab, visibleTab]);

  const renderTabContent = (tabId = activeTab) => {
    switch (tabId) {
      case "informasi":
        return (
          <InformationTabContent
            bio={bio}
            summaryData={summaryData}
            loading={loading}
            error={error}
            companySlug={companySlug}
            companyName={companyName}
          />
        );

      case "testimonial":
        return (
          <ReviewsTabContent
            companySlug={companySlug}
            companyName={companyName}
            summaryData={summaryData}
          />
        );

      case "recruitment":
        return <RecruitmentTabContent companySlug={companySlug} companyName={companyName} />;

      default:
        return null;
    }
  };

  return (
    <div>
      <TabNavigation
        tabs={COMPANY_DETAIL_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="relative mt-8 min-h-[320px] overflow-hidden">
        {tabTransition ? (
          <>
            <div
              className={`absolute inset-0 transition-opacity duration-200 ease-out pointer-events-none ${
                tabTransition.phase === "crossfading" ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden={tabTransition.phase === "crossfading"}
            >
              {renderTabContent(tabTransition.from)}
            </div>
            <div
              className={`absolute inset-0 transition-opacity duration-200 ease-out ${
                tabTransition.phase === "crossfading" ? "opacity-100" : "opacity-0"
              }`}
            >
              {renderTabContent(tabTransition.to)}
            </div>
          </>
        ) : (
          <div>{renderTabContent(visibleTab)}</div>
        )}
      </div>
    </div>
  );
};
