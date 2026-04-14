import Sidebar from "@/components/dashboard/mentee/Sidebar";
import TopHeader from "@/components/dashboard/mentee/TopHeader";

export default function MenteeDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        <TopHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
