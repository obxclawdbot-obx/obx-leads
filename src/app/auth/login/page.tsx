"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error de autenticación");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            OBX <span className="text-[#00ff88]">Leads</span>
          </h1>
          <p className="text-[#555] mt-2">Base de datos B2B España</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#181818] border border-[#222] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#555] mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88] placeholder:text-[#444] transition-colors"
                placeholder="tu@empresa.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#555] mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88] placeholder:text-[#444] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#00ff88] hover:bg-[#00e07a] text-[#0a0a0a] font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-[#555] mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-[#00ff88] hover:underline">Regístrate</Link>
          </p>

          <div className="mt-4 p-3 bg-[#111] rounded-xl border border-[#222]">
            <p className="text-xs text-[#444] text-center">Demo: demo@obxleads.com / demo1234</p>
          </div>
        </form>
      </div>
    </div>
  );
}
