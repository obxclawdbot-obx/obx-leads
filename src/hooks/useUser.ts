"use client";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/auth/login";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
