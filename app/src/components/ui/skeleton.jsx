import React from "react";

// Simple, reusable skeleton primitives using Tailwind classes
export function Skeleton({ className = "" }) {
  return <div className={`bg-gray-200 dark:bg-gray-700 rounded ${className} animate-pulse`} />;
}

export function SkeletonLine({ className = "", width = "full", height = "h-4" }) {
  const widthClass = width === "full" ? "w-full" : width;
  return <div className={`bg-gray-200 dark:bg-gray-700 rounded ${height} ${widthClass} ${className} animate-pulse`} />;
}

export function SkeletonCircle({ className = "", size = 10 }) {
  // For custom pixel sizes, use className prop for Tailwind classes (e.g., w-10 h-10)
  // Or provide a size number for inline style fallback
  const sizeClass = {
    4: 'w-4 h-4',
    6: 'w-6 h-6',
    8: 'w-8 h-8',
    10: 'w-10 h-10',
    12: 'w-12 h-12',
    16: 'w-16 h-16',
    20: 'w-20 h-20',
    24: 'w-24 h-24',
  }[size];

  if (sizeClass) {
    return <div className={`bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClass} ${className} animate-pulse`} />;
  }

  // Fallback for custom pixel sizes
  const px = `${size}px`;
  return <div className={`bg-gray-200 dark:bg-gray-700 rounded-full ${className} animate-pulse`} style={{ width: px, height: px }} />;
};
