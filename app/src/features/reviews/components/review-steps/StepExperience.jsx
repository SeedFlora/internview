import React from "react";
import { CircleCheckBig, Smile, Meh, Frown, OctagonAlert } from "lucide-react";

const DIFFICULTY_OPTIONS = [
  { value: 1, label: "Sangat Mudah", Icon: CircleCheckBig },
  { value: 2, label: "Mudah", Icon: Smile },
  { value: 3, label: "Sedang", Icon: Meh },
  { value: 4, label: "Sulit", Icon: Frown },
  { value: 5, label: "Sangat Sulit", Icon: OctagonAlert },
];

export const Step3Experience = ({ form, lookupData }) => {
  const { register, watch, setValue, trigger, formState: { errors } } = form;

  const admissionTrack = watch("admissionTrack");
  const recruitmentSteps = watch("recruitmentSteps") || [];
  const recruitmentDurationCode = watch("recruitmentDurationCode");
  const interviewDifficulty = watch("interviewDifficulty");

  const admissionOptions = lookupData?.ADMISSION_TRACK ?? [];
  const recruitmentOptions = lookupData?.RECRUITMENT_STEPS ?? [];
  const durationOptions = lookupData?.RECRUITMENT_DURATION ?? [];

  const handleAdmissionTrackToggle = (value) => {
    setValue("admissionTrack", admissionTrack === value ? "" : value);
    trigger("admissionTrack");
  };

  const handleRecruitmentToggle = (value) => {
    const numValue = Number(value);
    const updated = recruitmentSteps.includes(numValue)
      ? recruitmentSteps.filter((v) => v !== numValue)
      : [...recruitmentSteps, numValue];
    setValue("recruitmentSteps", updated);
    trigger("recruitmentSteps");
  };

  const handleDurationToggle = (value) => {
    setValue("recruitmentDurationCode", recruitmentDurationCode === value ? "" : value);
    trigger("recruitmentDurationCode");
  };

  return (
    <div className="space-y-8">
      {/* Jalur Pendaftaran */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Jalur Pendaftaran <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">Pilih jalur yang kamu gunakan saat mendaftar.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {admissionOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleAdmissionTrackToggle(opt.value)}
              className={`border rounded-xl px-4 py-3 text-sm text-center cursor-pointer transition-colors ${
                admissionTrack === opt.value
                  ? "border-orange-400 bg-orange-50 text-orange-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.admissionTrack && <p className="text-red-500 text-xs mt-1">{errors.admissionTrack.message}</p>}
      </div>

      {/* Tahapan Seleksi */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Tahapan Seleksi yang Dilalui <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">Centang semua tahapan yang kamu lalui selama proses seleksi.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recruitmentOptions.map((opt) => {
            const checked = recruitmentSteps.includes(Number(opt.value));
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  checked ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input type="checkbox" checked={checked} onChange={() => handleRecruitmentToggle(opt.value)} className="sr-only" />
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                  checked ? "bg-orange-500 border-orange-500" : "border-gray-300 bg-white"
                }`}>
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                  checked ? "bg-orange-400 text-white" : "bg-gray-200 text-gray-500"
                }`}>{opt.value}</span>
                <span className="text-sm text-gray-800">{opt.label}</span>
              </label>
            );
          })}
        </div>
        {errors.recruitmentSteps && <p className="text-red-500 text-xs mt-1">{errors.recruitmentSteps.message}</p>}
      </div>

      {/* Durasi Proses Seleksi */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Durasi Proses Seleksi <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">Berapa lama proses seleksi dari awal apply hingga diterima?</p>
        <div className="flex gap-3">
          {durationOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleDurationToggle(opt.value)}
              className={`flex-1 border rounded-xl px-4 py-3 text-sm text-center cursor-pointer transition-colors ${
                recruitmentDurationCode === opt.value
                  ? "border-orange-400 bg-orange-50 text-orange-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.recruitmentDurationCode && <p className="text-red-500 text-xs mt-1">{errors.recruitmentDurationCode.message}</p>}
      </div>

      {/* Tingkat Kesulitan */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Tingkat Kesulitan Seleksi <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-5 gap-3">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setValue("interviewDifficulty", opt.value); trigger("interviewDifficulty"); }}
              className={`flex flex-col items-center gap-2 py-4 border rounded-xl cursor-pointer transition-colors ${
                interviewDifficulty === opt.value
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <opt.Icon className="h-6 w-6 text-slate-500" />
              <span className={`text-sm font-medium ${interviewDifficulty === opt.value ? "text-orange-500" : "text-gray-700"}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
        {errors.interviewDifficulty && <p className="text-red-500 text-xs mt-1">{errors.interviewDifficulty.message}</p>}
      </div>

      {/* Contoh Pertanyaan Wawancara */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Contoh Pertanyaan Wawancara <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">Bagikan contoh pertanyaan yang kamu dapatkan saat wawancara.</p>
        <textarea
          {...register("exampleQuestions")}
          rows={4}
          placeholder={`Contoh:\n- Ceritakan pengalaman organisasi yang paling berkesan\n- Apa motivasi kamu melamar di perusahaan ini?\n- Jelaskan proyek yang pernah kamu kerjakan`}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder:text-gray-400"
        />
        {errors.exampleQuestions && <p className="text-red-500 text-xs mt-1">{errors.exampleQuestions.message}</p>}
      </div>

      {/* Pengalaman Proses Seleksi */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Ceritakan Pengalaman Proses Seleksimu <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">Ceritakan secara lengkap pengalaman seleksimu dari awal mendaftar hingga diterima.</p>
        <textarea
          {...register("selectionProcess")}
          rows={5}
          placeholder="Contoh: Saya mendaftar melalui portal Kampus Merdeka batch 6..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder:text-gray-400"
        />
        {errors.selectionProcess && <p className="text-red-500 text-xs mt-1">{errors.selectionProcess.message}</p>}
      </div>

      {/* Tips & Trik */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Tips & Trik Lolos Seleksi <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">Bagikan tips spesifik yang bisa membantu kandidat lain lolos seleksi.</p>
        <textarea
          {...register("tipsTricks")}
          rows={4}
          placeholder={`Contoh:\n- Pelajari core values perusahaan\n- Siapkan portofolio yang relevan\n- Latihan soal psikotes TPA dan logika`}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm text-gray-700 placeholder:text-gray-400"
        />
        {errors.tipsTricks && <p className="text-red-500 text-xs mt-1">{errors.tipsTricks.message}</p>}
      </div>
    </div>
  );
};
