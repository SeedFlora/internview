import React from "react";

export const EmptyStateCard = ({ title, message }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-gray-600 italic">{title && <span className="font-medium">{title}: </span>}{message}</p>
    </div>
  );
};
