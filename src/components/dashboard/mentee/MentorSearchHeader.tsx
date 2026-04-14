"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

export default function MentorSearchHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams || undefined);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Explore Mentors</h1>
        <p className="text-slate-500 mt-1">Find the perfect guide for your career journey.</p>
      </div>
      <div className="relative w-full md:w-96 group">
        <Search className={`absolute left-3 top-3 overflow-visible transition-colors w-5 h-5 ${isPending ? 'text-indigo-400 animate-pulse' : 'text-slate-400 group-hover:text-indigo-500'}`} />
        <input 
          type="text" 
          placeholder="Search by name, role, or skill..." 
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams?.get("query")?.toString()}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
        />
        {isPending && (
          <div className="absolute right-3 top-3.5">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
