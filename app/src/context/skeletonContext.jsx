import React, { createContext, useContext, useState } from "react";

const SkeletonContext = createContext({
  preferSkeleton: true,
  setPreferSkeleton: () => {},
});

export function SkeletonProvider({ children, defaultPrefer = true }) {
  const [preferSkeleton, setPreferSkeleton] = useState(defaultPrefer);

  return (
    <SkeletonContext.Provider value={{ preferSkeleton, setPreferSkeleton }}>
      {children}
    </SkeletonContext.Provider>
  );
}

export function useSkeletonPreferences() {
  return useContext(SkeletonContext);
}
