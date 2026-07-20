import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CompanyFilterDropdown = ({ options, activeValue, onChange }) => {
  const activeOption = options.find((option) => option.id === activeValue) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-11 min-w-[148px] justify-between rounded-2xl border-slate-200 bg-white px-4 font-inter text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-50"
        >
          {activeOption?.label ?? "All"}
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[148px] rounded-xl border-slate-200 p-1">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => onChange(option.id)}
            className="rounded-lg px-3 py-2 font-inter text-sm text-slate-700"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
