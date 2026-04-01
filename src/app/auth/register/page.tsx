"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al registrar");
      setLoading(false);
      return;
    }

    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      setError("Cuenta creada. Por favor inicia sesión.");
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            OBX <span className="text-[#00ff88]">Leads</span>
          </h1>
          <p className="text-[#555] mt-2">Crea tu cuenta</p>
        </div>

        <div className="bg-[#181818] border border-[#222] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Registro</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#555] mb-1.5 uppercase tracking-wider">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00ff88] placeholder:text-[#444] transition-colors"
                placeholder="Tu nombre"
                required
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff88] hover:bg-[#00e07a] text-[#0a0a0a] font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-[#555] mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-[#00ff88] hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
