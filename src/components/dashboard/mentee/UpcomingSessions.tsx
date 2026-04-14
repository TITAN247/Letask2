import { CalendarX, CalendarRange, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function UpcomingSessions({ sessions = [] }: { sessions?: any[] }) {
  const hasSessions = sessions.length > 0;

  // Helper to safely format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'TBD';
      return date.toLocaleDateString('en-US', { month: 'short' });
    } catch {
      return 'TBD';
    }
  };

  const formatDay = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { day: 'numeric' });
    } catch {
      return '-';
    }
  };

  const formatTime = (dateStr: string, timeSlot?: string) => {
    if (timeSlot) return timeSlot;
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'TBD';
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch {
      return 'TBD';
    }
  };

  const getMentorName = (session: any) => {
    if (session.mentorId?.name) return session.mentorId.name;
    if (session.mentor?.name) return session.mentor.name;
    if (session.mentorId && typeof session.mentorId === 'object') {
      return session.mentorId.name || 'Mentor';
    }
    return 'Mentor';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-indigo-500" />
          Upcoming Sessions
        </h2>
      </div>

      {hasSessions ? (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-slate-200 min-w-[3.5rem] shadow-sm group-hover:border-indigo-200 transition-colors">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                        {formatDate(session.date || session.timestamp)}
                    </span>
                    <span className="text-xl font-black text-slate-700">
                        {formatDay(session.date || session.timestamp)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{session.type || '1:1 Session'}</span>
                    <span className="text-sm text-slate-500 font-medium">with {getMentorName(session)}</span>
                    <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md w-max border border-slate-200">
                        {formatTime(session.date || session.timestamp, session.timeSlot)} • {session.status}
                    </span>
                  </div>
              </div>
              
              {(session.status === 'accepted' || session.status === 'chat_active') && (
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Link href={`/dashboard/chat/${session._id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:shadow-indigo-500/20 hover:bg-indigo-700 transition-all">
                        <MessageSquare className="w-4 h-4" /> Start Chat
                    </Link>
                  </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <CalendarX className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-semibold">You have no sessions yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-[200px]">
            Ready to learn? Find a mentor and book your first session.
          </p>
        </div>
      )}
    </div>
  );
}
