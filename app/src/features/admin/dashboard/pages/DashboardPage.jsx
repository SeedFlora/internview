import { Building2, CheckCircle, Users, Star } from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { StatCard } from "../components/StatCard";
import { TopReviewedCompaniesChart } from "../components/TopReviewedCompaniesChart";
import { MonthlyTrendsChart } from "../components/MonthlyTrendsChart";

const STAT_CARD_CONFIG = [
  { label: "Total Companies", key: "totalCompanies", icon: Building2, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { label: "Pending Verifications", key: "pendingVerifications", icon: CheckCircle, iconBg: "bg-orange-50", iconColor: "text-orange-400" },
  { label: "Total Users", key: "totalUsers", icon: Users, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  { label: "Total Reviews", key: "totalReviews", icon: Star, iconBg: "bg-yellow-50", iconColor: "text-yellow-500" },
];

export function DashboardPage() {
  const { stats, loading, topCompanies, trendData } = useDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of platform statistics and trends</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARD_CONFIG.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={stats?.[card.key]}
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
            loading={loading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopReviewedCompaniesChart data={topCompanies} />
        <MonthlyTrendsChart data={trendData} />
      </div>
    </div>
  );
}
