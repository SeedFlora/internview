import { useEffect, useRef } from "react";

/**
 * Custom hook untuk intersection observer - lazy load at scroll
 * @param {boolean} isLoading - Status loading
 * @param {boolean} hasMore - Ada data lebih untuk di-fetch
 * @param {Function} onIntersect - Callback ketika element intersect
 * @param {number} threshold - Threshold untuk intersection (0-1)
 */
export const useIntersectionObserver = (
  isLoading,
  hasMore,
  onIntersect,
  threshold = 0.5
) => {
  const elementRef = useRef(null);
  const callbackRef = useRef(onIntersect);
  const isObserverActiveRef = useRef(false);

  // Update the callback ref whenever onIntersect changes
  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (isLoading || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Debounce: only call if not already observing and element is intersecting
        if (entries[0].isIntersecting && hasMore && !isLoading && !isObserverActiveRef.current) {
          isObserverActiveRef.current = true;
          callbackRef.current();
          
          // Reset flag after a short delay to allow next intersection
          setTimeout(() => {
            isObserverActiveRef.current = false;
          }, 100);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isLoading, hasMore, threshold]);

  return elementRef;
};
