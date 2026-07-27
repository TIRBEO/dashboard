export const SectionEyebrow = ({ label, tag }: { label: string; tag?: string }) => (
  <div className="flex items-center gap-3">
    <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]" />
    <span className="text-sm font-medium text-[#FFFFFF]">{label}</span>
    {tag && (
      <span className="px-2 py-0.5 rounded-full border border-[#FFFFFF]/10 text-[#FFFFFF]/50 text-xs">
        {tag}
      </span>
    )}
  </div>
);
