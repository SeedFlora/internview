import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function AuthSplitLayout({
  children,
  title,
  description,
  imageUrl,
  imagePosition = "center",
}) {
  return (
    <div className="min-h-svh bg-white lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
      <aside className="relative hidden min-h-svh overflow-hidden bg-slate-900 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: imagePosition }}
        />
        <div className="absolute inset-0 bg-slate-950/58" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(15,23,42,0.72))]" />

        <div className="relative flex h-full flex-col justify-end p-10 xl:p-16">
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white xl:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-white/75 xl:text-lg">
            {description}
          </p>
        </div>
      </aside>

      <section className="flex min-h-svh flex-col bg-white px-5 py-5 sm:px-8 lg:px-14 lg:py-8 xl:px-20">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Back to Homepage
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center py-10 lg:items-center lg:py-0">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </section>
    </div>
  );
}