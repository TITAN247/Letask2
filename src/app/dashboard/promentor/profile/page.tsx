import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileEditorClient from "@/components/dashboard/mentor/ProfileEditorClient";
import { UserCircle } from "lucide-react";

export default async function ProMentorProfile() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) redirect("/login/promentor");

    await dbConnect();
    const profile = await MentorProfile.findOne({ userId: (sessionUser as any).id }).lean();

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">
                    <UserCircle className="w-3.5 h-3.5" /> Operations
                </div>
                <h1 className="text-3xl font-black text-slate-800">Pro-Mentor Settings</h1>
                <p className="text-slate-500 mt-2">Configure your expertise, define session pricing, and establish your calendar availability.</p>
            </div>
            
            <ProfileEditorClient 
                initialProfile={profile ? JSON.parse(JSON.stringify(profile)) : null} 
                role="promentor"
            />
        </div>
    );
}
