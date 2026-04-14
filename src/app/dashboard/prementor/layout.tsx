import MentorSidebar from "@/components/dashboard/mentor/MentorSidebar";

export default function PreMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <MentorSidebar role="prementor" />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
