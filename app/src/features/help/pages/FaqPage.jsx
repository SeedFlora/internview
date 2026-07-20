import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";

const faqItems = [
  {
    question: "Apa itu InternView?",
    answer:
      "InternView adalah platform ulasan magang untuk mahasiswa BINUS University yang membantu pengguna menemukan pengalaman magang terbaik melalui review perusahaan, proses rekrutmen, dan informasi pengalaman intern dari mahasiswa lain.",
  },
  {
    question: "Apakah saya harus memiliki akun untuk menulis review di InternView?",
    answer:
      "Ya. Pengguna perlu memiliki akun terlebih dahulu untuk dapat menulis review, menyimpan perusahaan, dan menggunakan fitur personal lainnya di InternView.",
  },
  {
    question: "Apa saja yang bisa dilihat dari sebuah perusahaan di InternView?",
    answer:
      "Pengguna dapat melihat informasi perusahaan, rating review, pengalaman internship, recruitment process, kategori pekerjaan populer, durasi magang, serta detail ulasan dari mahasiswa yang pernah magang di perusahaan tersebut.",
  },
  {
    question: "Apa fungsi fitur Save Company?",
    answer:
      "Fitur Save Company memungkinkan pengguna menyimpan perusahaan yang menarik untuk dilihat kembali nanti. Daftar perusahaan yang disimpan akan muncul pada halaman profile pengguna.",
  },
  {
    question: "Apa fungsi fitur Compare Company?",
    answer:
      "Fitur Compare membantu pengguna membandingkan dua perusahaan secara langsung berdasarkan informasi internship, rating, dan karakteristik pengalaman magang agar lebih mudah menentukan pilihan.",
  },
  {
    question: "Apakah saya bisa melihat review yang pernah saya buat?",
    answer:
      "Ya. Semua review yang pernah dikirim akan tercatat pada halaman profile dalam bagian Recent Reviews sehingga pengguna dapat melihat kembali riwayat kontribusinya.",
  },
  {
    question: "Siapa yang dapat menggunakan InternView?",
    answer:
      "InternView dirancang untuk mahasiswa dan alumni BINUS University yang ingin berbagi maupun mencari referensi pengalaman magang.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/80 md:px-6"
      >
        <span className="text-[15px] font-semibold leading-6 text-slate-900 md:text-base">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" />
        )}
      </button>

      {isOpen ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 md:px-6 md:py-5">
          <p className="max-w-4xl text-sm leading-7 text-slate-600 md:text-[15px]">
            {item.answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState(-1);

  const handleToggle = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? -1 : index));
  };

  return (
    <main className="bg-slate-50/50">
      <section className="bg-gray-50 py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="mb-3 text-4xl font-semibold text-gray-900 md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mb-6 max-w-2xl text-gray-600">
              Semua hal penting yang perlu kamu ketahui tentang penggunaan InternView.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-20">
        <Container>
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="px-0 py-0">
              <div role="list" className="divide-y divide-slate-200">
                {faqItems.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    item={item}
                    isOpen={openIndex === index}
                    onToggle={() => handleToggle(index)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>
    </main>
  );
}