"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Mail, 
  Calendar,
  Award,
  BookOpen,
  Star,
  Edit3,
  Globe,
  GraduationCap,
  Clock,
  Languages
} from "lucide-react";
import Link from "next/link";

interface MenteeProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  languages?: string[];
  onboarding?: {
    currentStatus?: string;
    techSpecialization?: string;
    experienceLevel?: string;
  };
  sessionsCompleted?: number;
  streakDays?: number;
  badges?: string[];
  createdAt?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export default function MenteeProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<MenteeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        setError("Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Profile not found"}</p>
          <button 
            onClick={() => router.push("/dashboard/mentee")}
            className="text-indigo-600 font-bold hover:underline"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const joinDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/mentee"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
          
          <div className="px-6 pb-6">
            {/* Avatar and Name Section */}
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6 gap-4">
              <div className="relative">
                {(profile.avatar || profile.profilePicture) ? (
                  <img 
                    src={profile.avatar || profile.profilePicture} 
                    alt={profile.name}
                    className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 md:mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
              </div>

              <button 
                onClick={() => router.push("/dashboard/mentee")}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {profile.country && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Country</p>
                    <p className="text-sm font-bold text-slate-700">{profile.country}</p>
                  </div>
                </div>
              )}
              
              {profile.onboarding?.experienceLevel && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Experience Level</p>
                    <p className="text-sm font-bold text-slate-700">{profile.onboarding.experienceLevel}</p>
                  </div>
                </div>
              )}

              {profile.onboarding?.currentStatus && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Current Status</p>
                    <p className="text-sm font-bold text-slate-700">{profile.onboarding.currentStatus}</p>
                  </div>
                </div>
              )}

              {profile.onboarding?.techSpecialization && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Specialization</p>
                    <p className="text-sm font-bold text-slate-700">{profile.onboarding.techSpecialization}</p>
                  </div>
                </div>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Languages className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Languages</p>
                    <p className="text-sm font-bold text-slate-700">{profile.languages.join(", ")}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Member Since</p>
                  <p className="text-sm font-bold text-slate-700">{joinDate}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(profile.linkedInUrl || profile.githubUrl || profile.portfolioUrl) && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Links</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.linkedInUrl && (
                    <a 
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#0077B5] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a 
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      GitHub
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a 
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-bold text-slate-500">Sessions</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{profile.sessionsCompleted || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Completed sessions</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-bold text-slate-500">Streak</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{profile.streakDays || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Day streak</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-sm font-bold text-slate-500">Badges</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{profile.badges?.length || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Earned badges</p>
          </div>
        </div>
      </div>
    </div>
  );
}
