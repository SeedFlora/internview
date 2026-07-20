import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { BriefcaseBusiness, Clock3, MapPin, Package } from "lucide-react";

export const InformationDetailsCard = ({ data }) => {
  if (!data) {
    return null;
  }

  const { type, workScheme, duration, subCategories } = data;

  const InformationField = ({ icon, label, value }) => {
    const FieldIcon = icon;

    return (
      <div className="flex min-h-[96px] gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <FieldIcon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-plus-jakarta text-base font-bold text-slate-900 md:text-lg">
            {label}
          </p>
          <div className="mt-1 font-inter text-sm leading-6 text-slate-600">{value}</div>
        </div>
      </div>
    );
  };

  const internshipTypeMap = {
    P: "Part-time",
    F: "Full-time",
    I: "Internship",
  };

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-white">
        <CardTitle className="font-plus-jakarta text-lg font-bold text-slate-900">
          Internship Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InformationField
            icon={MapPin}
            label="Work Scheme"
            value={
              workScheme && workScheme.length > 0 ? (
                workScheme.join(", ")
              ) : (
                <span className="text-slate-400">N/A</span>
              )
            }
          />

          <InformationField
            icon={Clock3}
            label="Average Duration"
            value={duration ? duration : <span className="text-slate-400">N/A</span>}
          />

          <InformationField
            icon={BriefcaseBusiness}
            label="Popular Categories"
            value={
              subCategories && subCategories.length > 0 ? (
                subCategories.join(", ")
              ) : (
                <span className="text-slate-400">N/A</span>
              )
            }
          />

          <InformationField
            icon={Package}
            label="Internship Type"
            value={type ? internshipTypeMap[type] || type : <span className="text-slate-400">N/A</span>}
          />
        </div>
      </CardContent>
    </Card>
  );
};
