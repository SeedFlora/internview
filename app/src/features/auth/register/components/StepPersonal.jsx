import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound, Phone } from "lucide-react";

export function StepPersonal({ form }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="firstName"
              placeholder="Enter your first name"
              {...form.register("firstName")}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
            />
          </div>
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="lastName"
              placeholder="Enter your last name"
              {...form.register("lastName")}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
            />
          </div>
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            {...form.register("phoneNumber")}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm shadow-none transition-colors focus-visible:bg-white"
          />
        </div>
        {form.formState.errors.phoneNumber && (
          <p className="text-sm text-red-500">{form.formState.errors.phoneNumber.message}</p>
        )}
      </div>
    </div>
  );
}