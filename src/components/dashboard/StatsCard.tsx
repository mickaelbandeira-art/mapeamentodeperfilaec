import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export const StatsCard = ({ title, value, icon: Icon, description, className }: StatsCardProps) => {
  return (
    <div className={`p-8 border-4 border-foreground group hover:translate-x-1 hover:translate-y-1 transition-all ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity">
          {title}
        </h3>
        <Icon className="h-6 w-6 group-hover:scale-125 transition-transform" />
      </div>
      <div className="space-y-1">
        <div className="text-5xl font-black italic leading-none tracking-tighter">
          {value}
        </div>
        {description && (
          <p className="text-[10px] font-bold uppercase opacity-40">{description}</p>
        )}
      </div>
      <div className="mt-6 pt-4 border-t-2 border-foreground/10 flex justify-between items-center">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-current" />
          <div className="w-1 h-1 bg-current opacity-50" />
          <div className="w-1 h-1 bg-current opacity-20" />
        </div>
        <span className="text-[8px] font-black uppercase italic">Live_Metric</span>
      </div>
    </div>
  );
};
