import { useState, useEffect } from "react";
import { getDashboardStatistics, getDashboardTrends, getTopReviewsCompanies } from "@/api/dashboardApi";

function formatTrendMonth(yearMonth) {
  const [year, month] = yearMonth.split("-");
  const label = new Date(Number(year), Number(month) - 1).toLocaleString("en", { month: "short" });
  return `${label} '${year.slice(2)}`;
}

export function useDashboardData() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topCompanies, setTopCompanies] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getDashboardStatistics()
      .then((data) => {
        if (!cancelled) setStats(data.result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    getTopReviewsCompanies().then((data) => {
      if (!cancelled) {
        setTopCompanies(
          (data.result ?? []).map((item) => ({
            name: item.companyName,
            reviews: item.totalReviews,
          }))
        );
      }
    });

    getDashboardTrends().then((data) => {
      if (!cancelled) {
        setTrendData(
          (data.result ?? []).map((item) => ({
            month: formatTrendMonth(item.month),
            reviews: item.reviewCount,
            companies: item.newCompanyCount,
          }))
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, topCompanies, trendData };
}
