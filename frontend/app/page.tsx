"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length > 0;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(ROUTES.dashboard);
    }
  }, [isAuthenticated, loading, router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message || "Invalid credentials");
      return;
    }
    router.replace(ROUTES.dashboard);
  };

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <main className="min-h-screen bg-background page-container py-8 sm:py-12 lg:py-16 flex items-center justify-center">
      <section className="w-full max-w-md premium-surface p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="Luxorld Real Estate"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain mx-auto"
          />
          <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em]">
            Luxorld Real Estate
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-[0.16em]">
            Admin Login
          </h1>
        </div>

        <form className="space-y-5 sm:space-y-6" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@luxorld.com"
                className="premium-input pl-12 text-xs tracking-wide"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="premium-input pl-12 text-xs tracking-wide"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full min-h-11 px-8 py-3.5 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing In..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
