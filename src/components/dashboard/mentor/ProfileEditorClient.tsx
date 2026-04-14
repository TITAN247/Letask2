"use client";

import { useState } from "react";
import { Save, Plus, X, Loader2, Camera, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface AvailabilitySlot {
  day: string;
  slots: string[];
}

interface ProfileEditorProps {
  initialProfile: any;
  role: 'prementor' | 'promentor';
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ProfileEditorClient({ initialProfile, role }: ProfileEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(initialProfile?.profilePicture || null);
  const [formData, setFormData] = useState({
    skills: initialProfile?.skills ? initialProfile.skills.join(", ") : "",
    experienceTitle: initialProfile?.experienceTitle || "",
    experienceYears: initialProfile?.experienceYears || "",
    description: initialProfile?.description || "",
    pricing: initialProfile?.pricing || 0,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProfilePicture(data.url);
      } else {
        alert(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    initialProfile?.availability?.length > 0 
      ? initialProfile.availability 
      : [{ day: "Monday", slots: ["10:00 AM"] }]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addAvailDay = () => {
    setAvailability([...availability, { day: "Monday", slots: ["10:00 AM"] }]);
  };

  const removeAvailDay = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateAvailDay = (index: number, day: string) => {
    const newAvail = [...availability];
    newAvail[index].day = day;
    setAvailability(newAvail);
  };

  const updateSlots = (index: number, slotsStr: string) => {
    const newAvail = [...availability];
    newAvail[index].slots = slotsStr.split(",").map(s => s.trim()).filter(s => s);
    setAvailability(newAvail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        skills: formData.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s),
        experienceTitle: formData.experienceTitle,
        experienceYears: Number(formData.experienceYears),
        description: formData.description,
        pricing: role === 'promentor' ? Number(formData.pricing) : 0,
        availability,
        profilePicture,
      };

      const res = await fetch("/api/profile/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Profile Picture Section */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Profile Picture</h2>
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center border-4 border-indigo-100">
                <User className="w-16 h-16 text-white" />
              </div>
            )}
            
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition shadow-lg">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          
          <p className="text-sm text-slate-500 text-center">
            Click the camera icon to upload a profile picture<br/>
            <span className="text-xs">(Max 2MB, JPG/PNG recommended)</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Professional Expertise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Role / Title</label>
            <input 
              required
              name="experienceTitle"
              value={formData.experienceTitle}
              onChange={handleInputChange}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              placeholder="e.g. Senior Frontend Engineer" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>
            <input 
              required
              type="number"
              min="0"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleInputChange}
              className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              placeholder="e.g. 5" 
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Skills & Technologies (comma separated)</label>
          <input 
            required
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            placeholder="React, Node.js, System Design, Career Guidance..." 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Biography</label>
          <textarea 
            required
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            placeholder="Tell mentees about your journey, what you can help them with, and your mentoring style..." 
          />
        </div>
      </div>

      {role === 'promentor' && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Pricing Strategy</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Session Flat-Rate ($ USD)</label>
            <div className="relative rounded-md shadow-sm w-48">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-slate-500 sm:text-sm font-bold">$</span>
              </div>
              <input
                type="number"
                min="0"
                name="pricing"
                value={formData.pricing}
                onChange={handleInputChange}
                className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white py-3 pl-8 focus:ring-indigo-500 focus:border-indigo-500 transition-colors block sm:text-sm font-bold text-slate-900"
                placeholder="0.00"
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">Mentees will be charged this amount per 30-minute session.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Weekly Availability</h2>
          <button 
            type="button" 
            onClick={addAvailDay}
            className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Day
          </button>
        </div>
        
        <div className="space-y-4">
          {availability.map((avail, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
              <select
                value={avail.day}
                onChange={(e) => updateAvailDay(index, e.target.value)}
                className="border-slate-200 rounded-lg text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-40"
              >
                {WEEKDAYS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              
              <div className="flex-1 w-full">
                <input 
                  value={avail.slots.join(", ")}
                  onChange={(e) => updateSlots(index, e.target.value)}
                  placeholder="e.g. 10:00 AM, 02:30 PM, 05:00 PM"
                  className="w-full border-slate-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button 
                type="button" 
                onClick={() => removeAvailDay(index)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {availability.length === 0 && (
            <p className="text-sm text-slate-500 italic text-center py-4">No availability configured.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {loading ? 'Saving Profile...' : 'Save All Changes'}
        </button>
      </div>
    </form>
  );
}
