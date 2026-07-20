// src/App.jsx
import React, { useEffect } from 'react';
import { useNavigate, BrowserRouter as Router, useLocation, matchRoutes } from "react-router-dom";
import { Navbar } from "@/components/common";
import { Toaster } from "sonner";
import { setNavigator } from '@/utils/history'; // Sesuaikan path jika perlu
import { AppRoutes } from "@/routes/AppRoutes";
import { appRoutes } from "@/routes/routesConfig";
import { SkeletonProvider } from "@/context/skeletonContext";
import { Footer } from "@/components/layout/Footer";

const NavigatorSetup = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Mengirimkan fungsi navigate ke history.js
    setNavigator(navigate); 
  }, [navigate]);
  return null; 
};

function Layout({ children }) {
  const location = useLocation();
  const matches = matchRoutes(appRoutes, location);
  const hideNavbar = matches?.some((match) => match.route.showNavbar === false) ?? false;

  return (
    <div className="flex min-h-screen flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideNavbar && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <Router>
      <SkeletonProvider defaultPrefer={true}>
        <NavigatorSetup />
        <Layout>
          <AppRoutes />
        </Layout>
        <Toaster/>
      </SkeletonProvider>
    </Router>
  );
}
