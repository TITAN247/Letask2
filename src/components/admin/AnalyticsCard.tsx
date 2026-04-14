"use client";

import { Users, Activity, DollarSign, Clock, TrendingUp } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Users,
  Activity,
  DollarSign,
  Clock,
  TrendingUp,
};

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend: string;
  color: string;
}

export default function AnalyticsCard({ title, value, icon, trend, color }: AnalyticsCardProps) {
  const Icon = iconMap[icon] || Users;
  
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
