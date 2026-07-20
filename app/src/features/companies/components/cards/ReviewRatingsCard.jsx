import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export const ReviewRatingsCard = ({ data }) => {
  if (!data) {
    return null;
  }

  const normalizeRating = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const ratingFields = [
    { key: "workCulture", label: "Budaya Kerja" },
    { key: "learningOpp", label: "Kesempatan Belajar" },
    { key: "mentorship", label: "Mentorship" },
    { key: "benefit", label: "Benefit" },
    { key: "workLifeBalance", label: "Work-Life Balance" },
  ];

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-white">
        <CardTitle className="font-plus-jakarta text-lg font-bold text-slate-900">Reviews Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {ratingFields.map(({ key, label }) => {
          const rating = normalizeRating(data[key]);
          const ratingPercentage = rating !== null ? (rating / 5) * 100 : 0;

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <p className="font-inter text-sm font-semibold text-slate-800">{label}</p>
                {rating !== null ? (
                  <span className="font-inter text-sm font-semibold text-slate-900">
                    {rating.toFixed(1)}
                  </span>
                ) : (
                  <span className="font-inter text-sm text-slate-400">N/A</span>
                )}
              </div>
              {rating !== null && (
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${ratingPercentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
