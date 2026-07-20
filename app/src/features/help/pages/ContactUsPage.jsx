import { Mail, MessageCircle, Clock3, Building2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";

const contactItems = [
  {
    title: "Email Support",
    description:
      "Untuk pertanyaan, kendala akun, atau laporan terkait konten review, silakan hubungi kami melalui email:",
    detail: "internview.support@gmail.com",
    icon: Mail,
    detailClassName: "text-orange-500",
  },
  {
    title: "User Feedback",
    description:
      "Kami sangat terbuka terhadap masukan untuk pengembangan InternView agar pengalaman pengguna menjadi lebih baik.",
    detail: null,
    icon: MessageCircle,
  },
  {
    title: "Response Time",
    description:
      "Tim InternView akan berusaha merespons pesan dalam 1–3 hari kerja.",
    detail: null,
    icon: Clock3,
  },
  {
    title: "Platform Scope",
    description:
      "InternView saat ini difokuskan untuk mahasiswa dan alumni BINUS University dalam mencari referensi pengalaman magang.",
    detail: null,
    icon: Building2,
  },
];

function ContactCard({ item }) {
  const Icon = item.icon;

  return (
    <Card className="h-full rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex h-full flex-col gap-3 p-5 md:p-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon className="h-4 w-4" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-[17px] font-semibold leading-6 text-slate-900">
            {item.title}
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            {item.description}
          </p>
          {item.detail ? (
            <a
              href={`mailto:${item.detail}`}
              className={`inline-flex text-sm font-semibold transition-colors hover:underline ${item.detailClassName ?? "text-slate-900"}`}
            >
              {item.detail}
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContactUsPage() {
  return (
    <main className="bg-slate-50/50">
      <section className="bg-gray-50 py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="mb-3 text-4xl font-semibold text-gray-900 md:text-5xl">
              Contact Us
            </h1>
            <p className="mb-6 max-w-2xl text-gray-600">
              Kami terbuka untuk pertanyaan, masukan, dan laporan agar pengalaman di InternView tetap nyaman.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-20">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {contactItems.map((item) => (
              <ContactCard key={item.title} item={item} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}