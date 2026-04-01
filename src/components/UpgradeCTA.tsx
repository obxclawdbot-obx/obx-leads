"use client";

interface UpgradeCTAProps {
  feature: string;
  requiredPlan: string;
  className?: string;
}

export function UpgradeCTA({ feature, requiredPlan, className = "" }: UpgradeCTAProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="bg-[#181818] border border-[#222] rounded-xl p-4 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <p className="text-[#888] text-sm mb-3">
          {feature} disponible en plan <span className="text-[#00ff88] font-semibold">{requiredPlan}</span>
        </p>
        <button className="px-4 py-2 bg-[#00ff88] text-[#0a0a0a] rounded-lg text-sm font-semibold hover:bg-[#00e07a] transition-colors">
          Upgrade →
        </button>
      </div>
    </div>
  );
}

export function LockedField({ label, requiredPlan }: { label: string; requiredPlan: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#555] uppercase">{label}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-sm text-[#333] blur-sm select-none">dato-oculto@email.com</span>
        <span className="text-xs bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded-full font-medium">
          Plan {requiredPlan}
        </span>
      </div>
    </div>
  );
}
