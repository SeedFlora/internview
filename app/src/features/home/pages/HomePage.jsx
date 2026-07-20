import { HeroSection } from "@/features/home/sections/HeroSection";
import { TopCompanies } from "@/features/home/sections/TopCompanies";
import { TopJobCategories } from "@/features/home/sections/TopJobCategories";
import { HighlightReview } from "@/features/home/sections/HighlightReview";

export function HomePage() {
  return (
    <main className="w-full">
      <HeroSection />
      <TopCompanies />
      <TopJobCategories />
      <HighlightReview />
    </main>
  );
}
