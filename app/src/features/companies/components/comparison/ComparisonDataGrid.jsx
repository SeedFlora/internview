import React from "react";

const ValueCell = ({ content }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-inter text-sm text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    {content !== null && content !== undefined && content !== "" ? content : <span className="text-slate-400">-</span>}
  </div>
);

export const ComparisonDataGrid = ({ rows, leftLabel = "Company A", rightLabel = "Company B" }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 border-b border-slate-200 pb-2 md:grid">
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Metrics</p>
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{leftLabel}</p>
        <p className="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{rightLabel}</p>
      </div>

      {rows.map((row) => (
        <div
          key={row.key}
          className="grid gap-3 rounded-2xl bg-slate-50/80 p-4 md:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:bg-transparent md:p-0"
        >
          <p className="font-inter text-sm font-semibold text-slate-800 md:pr-2">{row.label}</p>
          <div className="space-y-1">
            <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 md:hidden">{leftLabel}</p>
            <ValueCell content={row.leftValue} />
          </div>
          <div className="space-y-1">
            <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 md:hidden">{rightLabel}</p>
            <ValueCell content={row.rightValue} />
          </div>
        </div>
      ))}
    </div>
  );
};
