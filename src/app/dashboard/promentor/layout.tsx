import MentorSidebar from "@/components/dashboard/mentor/MentorSidebar";

export default function ProMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <MentorSidebar role="promentor" />
      <div className="flex-1 overflow-x-hidden pl-12 lg:pl-0">
        {children}
      </div>
    </div>
  );
}
