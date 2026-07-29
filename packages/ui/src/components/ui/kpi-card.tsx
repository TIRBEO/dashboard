import { type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({ label, value, trend, icon, className }: KpiCardProps) {
  return (
    <div className={cn("rounded-xl border border-tirbeo-neutral-300 bg-white p-5 shadow-card", className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-tirbeo-neutral-700 font-medium">{label}</p>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tirbeo-blue-50 text-tirbeo-blue-600">
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-tirbeo-neutral-900">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trend.positive ? (
            <TrendingUp className="w-4 h-4 text-tirbeo-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-tirbeo-red-500" />
          )}
          <span className={cn(
            "text-sm font-medium",
            trend.positive ? "text-tirbeo-green-600" : "text-tirbeo-red-600",
          )}>
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-sm text-tirbeo-neutral-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}
