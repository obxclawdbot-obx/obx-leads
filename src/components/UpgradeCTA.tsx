"use client";

import { useState } from "react";

interface UpgradeCTAProps {
  feature: string;
  requiredPlan: string;
  checkoutPlan?: "starter" | "growth" | "business";
  className?: string;
}

export function UpgradeCTA({ feature, requiredPlan, checkoutPlan, className = "" }: UpgradeCTAProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    const plan = checkoutPlan || requiredPlan.toLowerCase();
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="bg-[#181818] border border-[#222] rounded-xl p-4 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <p className="text-[#888] text-sm mb-3">
          {feature} disponible en plan <span className="text-[#00ff88] font-semibold">{requiredPlan}</span>
        </p>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="px-4 py-2 bg-[#00ff88] text-[#0a0a0a] rounded-lg text-sm font-semibold hover:bg-[#00e07a] transition-colors disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Upgrade →"}
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
