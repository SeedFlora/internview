import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchCompanies } from "@/api/companyApi";
import { handleApiResponse } from "@/helpers/apiUtils";

const certificateSchema = z.object({
  issuerId: z.string().min(1, "Issuer is required"),
  issuer: z.string().min(1, "Issuer is required"),
  certificateName: z.string().min(1, "Certificate name is required"),
});

const MAX_ISSUER_RESULTS = 3;

function IssuerSearchField({ field, fieldState, setValue }) {
  const [query, setQuery] = useState(field.value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(field.value || "");
  }, [field.value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    field.onChange(val);
    setValue("issuerId", "");

    clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchCompanies(val.trim());
        const { success, data } = handleApiResponse(response);
        if (success && Array.isArray(data)) {
          setSuggestions(data.slice(0, MAX_ISSUER_RESULTS));
          setOpen(data.length > 0);
        } else {
          setSuggestions([]);
          setOpen(false);
        }
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (company) => {
    setQuery(company.companyName);
    field.onChange(company.companyName);
    setValue("issuerId", String(company.companyId), { shouldValidate: true });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel className="font-inter text-sm text-slate-700">Issuer</FieldLabel>
      <div ref={containerRef} className="relative">
        <Input
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search company name"
          className="h-11 rounded-xl"
          autoComplete="off"
        />
        {loading && (
          <span className="font-inter absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            Searching...
          </span>
        )}
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            {suggestions.map((company) => (
              <li
                key={company.companyId}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(company);
                }}
                className="font-inter cursor-pointer px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                {company.companyName}
              </li>
            ))}
          </ul>
        )}
      </div>
      {fieldState.error && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}

export function CertificateModal({
  isOpen,
  onClose,
  onSubmit,
  selectedFile,
  handleFileChange,
  compressing,
  requestingUrl,
  uploading,
}) {
  const [fileInputKey, setFileInputKey] = useState(0);

  const certificateForm = useForm({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      issuerId: "",
      issuer: "",
      certificateName: "",
    },
  });

  const handleSubmit = (data) => {
    onSubmit(data, () => {
      certificateForm.reset();
      setFileInputKey((k) => k + 1);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <h2 className="font-plus-jakarta mb-4 text-xl font-semibold text-slate-900">Submit Certificate</h2>
        <form onSubmit={certificateForm.handleSubmit(handleSubmit)} className="space-y-4.5">
          <Controller
            name="issuer"
            control={certificateForm.control}
            render={({ field, fieldState }) => (
              <IssuerSearchField
                field={field}
                fieldState={fieldState}
                setValue={certificateForm.setValue}
              />
            )}
          />
          <Controller
            name="certificateName"
            control={certificateForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="font-inter text-sm text-slate-700">Certificate Name</FieldLabel>
                <Input {...field} placeholder="Enter certificate name" className="h-11 rounded-xl" />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* File Upload Section */}
          <div className="space-y-2">
            <Field>
              <FieldLabel className="font-inter text-sm text-slate-700">File</FieldLabel>
              <Input
                key={fileInputKey}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="h-11 rounded-xl"
              />
            </Field>

            {(compressing || requestingUrl) && (
              <p className="font-inter text-sm text-slate-500">
                {compressing ? "Compressing image..." : "Getting upload URL..."}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-xl px-4">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || compressing || requestingUrl || !selectedFile}
              className="h-10 rounded-xl bg-[#F97316] px-4 text-white hover:bg-[#EA580C]"
            >
              {compressing ? "Compressing..." : requestingUrl ? "Preparing..." : uploading ? "Submitting..." : "Submit Certificate"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}