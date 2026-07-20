import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/api/userApi";
import { normalizeErrorMessage } from "@/helpers/apiUtils";

// Mirrors the backend UpdateProfileRequest: firstName required, lastName
// optional, phoneNumber required (08 + 6-15 digits, same rule as register).
const schema = z.object({
  firstName: z.string().min(1, "Nama depan wajib diisi").max(50, "Maksimal 50 karakter"),
  lastName: z.string().max(50, "Maksimal 50 karakter").optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(/^08[0-9]{6,15}$/, "Harus diawali 08 dan berupa angka"),
});

export function EditProfileModal({ isOpen, onClose, user, onSaved }) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || null,
        phoneNumber: data.phoneNumber.trim(),
      });
      if (res?.success === false) {
        toast.error(res.message || "Failed to update profile");
        return;
      }
      toast.success("Profil berhasil diperbarui");
      await onSaved?.();
      onClose();
    } catch (err) {
      toast.error(normalizeErrorMessage(err, "Failed to update profile"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-plus-jakarta text-lg font-semibold text-slate-900">Edit Profil</h2>
            <p className="font-inter mt-1 text-sm text-slate-500">Perbarui informasi pribadimu.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="firstName">Nama Depan</FieldLabel>
                <Input {...field} id="firstName" placeholder="Nama depan" className="h-11 rounded-xl" />
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </Field>
            )}
          />

          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lastName">Nama Belakang</FieldLabel>
                <Input {...field} id="lastName" placeholder="Nama belakang (opsional)" className="h-11 rounded-xl" />
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </Field>
            )}
          />

          <Controller
            name="phoneNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phoneNumber">Nomor Telepon</FieldLabel>
                <Input {...field} id="phoneNumber" placeholder="08xxxxxxxxxx" className="h-11 rounded-xl" />
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </Field>
            )}
          />

          {/* Email is the login identity and is not editable here. */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="font-inter text-xs font-medium uppercase tracking-wide text-slate-400">Email (tidak dapat diubah)</p>
            <p className="font-plus-jakarta text-sm text-slate-500">{user?.email}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-[#F97316] hover:bg-[#EA580C]">
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
