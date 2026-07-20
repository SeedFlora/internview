import React from "react";
import { Clock } from "lucide-react";

const parsePercent = (str) => parseFloat(str?.replace("%", "")) || 0;

const ProgressBar = ({ label, value }) => (
  <div className="space-y-1.5">
  <div className="flex items-center justify-between">
      <span className="text-sm text-slate-800">{label}</span>
      <span className="tabular-nums text-sm text-slate-400">{value}</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-slate-800 transition-all"
        style={{ width: value }}
      />
    </div>
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</p>
);

export const RecruitmentStatisticsCard = ({ statistics }) => {
  if (!statistics) return null;

  const { admissionTrack, recruitmentDuration, frequentSelectionProcess } = statistics;

  const admissionEntries = Object.entries(admissionTrack ?? {}).sort(
    ([, a], [, b]) => parsePercent(b) - parsePercent(a)
  );
  const selectionEntries = Object.entries(frequentSelectionProcess ?? {}).sort(
    ([, a], [, b]) => parsePercent(b) - parsePercent(a)
  );

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-plus-jakarta text-lg font-bold text-slate-900">Recruitment Statistics</h3>

      {admissionEntries.length > 0 && (
        <div>
          <SectionLabel>Popular Application Tracks</SectionLabel>
          <div className="space-y-3">
            {admissionEntries.map(([track, pct]) => (
              <ProgressBar key={track} label={track} value={pct} />
            ))}
          </div>
        </div>
      )}

      {recruitmentDuration && (
        <div className="border-t border-slate-100 pt-6">
          <SectionLabel>Selection Duration</SectionLabel>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <Clock size={18} className="shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-900">{recruitmentDuration}</p>
              <p className="text-xs text-slate-400">Average selection duration</p>
            </div>
          </div>
        </div>
      )}

      {selectionEntries.length > 0 && (
        <div className="border-t border-slate-100 pt-6">
          <SectionLabel>Most Common Stages</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {selectionEntries.map(([step, pct]) => (
              <span
                key={step}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800"
              >
                {step}
                <span className="text-xs text-slate-400">({pct})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
