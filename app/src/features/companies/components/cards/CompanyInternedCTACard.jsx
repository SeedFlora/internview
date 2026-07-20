import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UnauthenticatedModal } from "@/components/common/UnauthenticatedModal";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const CompanyInternedCTACard = ({ companySlug, companyName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    navigate(`/review/${companySlug}`);
  };

  return (
    <Card className="overflow-hidden border border-orange-100 bg-linear-to-br from-orange-50 via-white to-orange-100/70 shadow-sm">
      <CardContent className="px-4 py-5 md:px-5 md:py-6">
        <div className="space-y-3 text-left">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-plus-jakarta text-base font-bold text-slate-900">
              Have You Interned Here Before?
            </h3>
            <p className="font-inter text-xs leading-relaxed text-slate-700">
              Help other students by sharing your internship experience at {companyName}.
            </p>
          </div>
          <Button
            onClick={handleWriteReview}
            className="mt-1 w-full rounded-full bg-orange-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Write a Review
          </Button>
        </div>
      </CardContent>

      {showAuthModal && (
        <UnauthenticatedModal
          redirectPath={location.pathname}
          onClose={() => setShowAuthModal(false)}
          message="You need to log in first to share your internship experience."
        />
      )}
    </Card>
  );
};
