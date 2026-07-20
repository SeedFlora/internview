export const getRequestStatusClass = (status) => {
  if (status === "APPROVED") {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }

  if (status === "REJECTED") {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }

  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
};

const getTimelineToneClass = (action) => {
  if (action === "START") {
    return "bg-slate-50 dark:bg-slate-900/20 border-slate-300 dark:border-slate-700";
  }

  if (["SUBMITTED", "PENDING"].includes(action)) {
    return "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700";
  }

  if (["COMPLETED", "APPROVED"].includes(action)) {
    return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700";
  }

  if (action === "REJECTED") {
    return "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700";
  }

  return "bg-muted border-border/60";
};

export const buildActivityTimeline = (auditLog, requestData, reviewInformation) => {
  if (!requestData) {
    return [];
  }

  const apiLogs = Array.isArray(auditLog) ? [...auditLog] : [];
  const hasStart = apiLogs.some((item) => item.action === "START");

  if (!hasStart && requestData.submittedAt) {
    apiLogs.unshift({
      action: "START",
      actor: requestData.submittedBy?.name || requestData.submittedBy || "System",
      timestamp: requestData.submittedAt,
    });
  }

  const terminalAction =
    reviewInformation?.status === "APPROVED" ? "COMPLETED" : reviewInformation?.status;

  if (
    terminalAction &&
    ["PENDING", "REJECTED", "COMPLETED"].includes(terminalAction) &&
    !apiLogs.some((item) => item.action === terminalAction)
  ) {
    apiLogs.push({
      action: terminalAction,
      actor:
        reviewInformation?.reviewedBy?.name || reviewInformation?.reviewedBy || requestData.submittedBy?.name || requestData.submittedBy || "System",
      timestamp:
        reviewInformation?.reviewedAt ||
        requestData.submittedAt ||
        new Date().toISOString(),
      notes: reviewInformation?.reviewNote || undefined,
    });
  }

  return [...apiLogs].reverse().map((log) => {
    const action = log.action || "UNKNOWN";
    const hideNotes = ["START", "PENDING", "COMPLETED"].includes(action);
    const hideActor = ["START", "PENDING", "COMPLETED"].includes(action);

    return {
      action,
      actor: log.actor || "System",
      timestamp: log.timestamp || null,
      notes: log.notes,
      hideNotes,
      hideActor,
      toneClass: getTimelineToneClass(action),
    };
  });
};
