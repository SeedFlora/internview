import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

/**
 * Component untuk menampilkan biography/deskripsi perusahaan
 * 
 * @param {string} bio - Bio/deskripsi perusahaan
 */
export const CompanyBioSection = ({ bio }) => {
  if (!bio) {
    return null;
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">Company Profile</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {bio}
        </div>
      </CardContent>
    </Card>
  );
};
