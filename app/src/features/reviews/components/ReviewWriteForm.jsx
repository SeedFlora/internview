import React from "react";
import { ReviewFormTabsPanel } from "./ReviewFormTabsPanel";

export const ReviewWriteForm = ({ company, onSubmit, loading, onCancel }) => {
  return (
    <ReviewFormTabsPanel
      company={company}
      onSubmit={onSubmit}
      loading={loading}
      onCancel={onCancel}
    />
  );
};
