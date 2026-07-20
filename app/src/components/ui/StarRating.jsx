import React, { useId } from "react";

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const SIZE_CLASSES = { xs: "w-3.5 h-3.5", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
const ACTIVE_STAR_COLOR = "#F97316";
const INACTIVE_STAR_COLOR = "#d1d5db";

const PreciseStar = ({ fillFraction, gradientId, sizeClass }) => {
  const isFull = fillFraction >= 1;
  const isEmpty = fillFraction <= 0;

  return (
    <svg
      className={sizeClass}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!isFull && !isEmpty && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset={`${fillFraction * 100}%`} stopColor={ACTIVE_STAR_COLOR} />
            <stop offset={`${fillFraction * 100}%`} stopColor={INACTIVE_STAR_COLOR} />
          </linearGradient>
        </defs>
      )}
      <path
        fill={
          isFull ? ACTIVE_STAR_COLOR : isEmpty ? INACTIVE_STAR_COLOR : `url(#${gradientId})`
        }
        d={STAR_PATH}
      />
    </svg>
  );
};

export const StarRating = ({ rating, size = "sm", className = "" }) => {
  const uid = useId();
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.sm;
  const value = rating ?? 0;

  return (
    <div className={`flex gap-0.5 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fillFraction = Math.min(1, Math.max(0, value - i));
        return (
          <PreciseStar
            key={i}
            fillFraction={fillFraction}
            gradientId={`${uid}-star-${i}`}
            sizeClass={sizeClass}
          />
        );
      })}
    </div>
  );
};
