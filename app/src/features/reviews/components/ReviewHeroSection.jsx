import { Container } from "@/components/layout/Container";

export function ReviewHeroSection() {
  return (
    <section className="bg-gray-50 py-16">
      <Container>
        <h1 className="mb-3 text-4xl font-semibold text-gray-900 md:text-5xl">
          Write Review
        </h1>
        <p className="mb-6 max-w-2xl text-gray-600">
          Bagikan pengalaman magang kamu untuk membantu teman-teman mahasiswa lainnya!
        </p>
      </Container>
    </section>
  );
}
