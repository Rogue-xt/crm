"use client";

import { Input } from "@/components/ui/input";
import { Search, FilterX } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function SearchFilters({ departments, designations }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for the search input to keep it responsive
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilter("q", searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  const resetFilters = () => {
    setSearchValue("");
    router.replace(pathname);
  };

// Inside SearchFilters.tsx
return (
  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
    
    {/* Search Input - Expands to fill space */}
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        placeholder="Search by name or ID..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-11 pr-4 w-full h-12 border-none bg-slate-50 rounded-2xl font-bold text-xs focus-visible:ring-1 focus-visible:ring-blue-500"
      />
    </div>

    {/* Select Group - Two side-by-side on tablet/mobile, inline on desktop */}
    <div className="flex flex-row gap-2">
      <Select onValueChange={(val) => handleFilter("dept", val)} value={searchParams.get("dept") || "ALL"}>
        <SelectTrigger className="flex-1 lg:w-48 p-[24px] h-12 border-none bg-slate-50 rounded-2xl font-bold text-[10px] uppercase tracking-widest">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-slate-100">
          <SelectItem value="ALL">All Departments</SelectItem>
          {departments.map((d: any) => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(val) => handleFilter("desig", val)} value={searchParams.get("desig") || "ALL"}>
        <SelectTrigger className="flex-1 p-[24px] lg:w-48 h-12 border-none bg-slate-50 rounded-2xl font-bold text-[10px] uppercase tracking-widest">
          <SelectValue placeholder="Designation" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-slate-100">
          <SelectItem value="ALL">All Titles</SelectItem>
          {designations.map((d: any) => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Button */}
      {(searchParams.get("q") || searchParams.get("dept") || searchParams.get("desig")) && (
        <Button 
          variant="ghost" 
          onClick={resetFilters}
          className="h-12 w-12 rounded-2xl hover:bg-rose-50 hover:text-rose-500 shrink-0"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);
}
