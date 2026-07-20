import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { appRoutes } from "./routesConfig";

// BUG FIX: this used `import { suspense }` (no such export) and a lowercase
// <suspense> tag, which React renders as an unknown DOM element -- NOT a
// Suspense boundary. Lazy routes therefore had no fallback: on a slow load the
// tree suspended with nothing to catch it and committed a blank white page, and
// every render logged "The tag <suspense> is unrecognized". Real boundary now.
export function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>}>
      <Routes>
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Suspense>
  );
}
