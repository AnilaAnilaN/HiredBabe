"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session, AuthResponse } from "@supabase/supabase-js";
import AuthModal from "@/components/auth/AuthModal";
import UserMenu from "@/components/auth/UserMenu";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

    /* get initial session */
    supabase.auth.getUser().then((res: AuthResponse) => {
      setUser(res.data?.user ?? null);
    });

    /* listen for auth changes (login, logout, token refresh) */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-electric-yellow/20 bg-obsidian/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tighter text-electric-yellow transition-all group-hover:text-white sm:text-2xl">
                HIRED
              </span>
              <span className="text-xl font-extrabold tracking-tighter text-silver-fox transition-all group-hover:text-hot-pink sm:text-2xl">
                BABE
              </span>
              <span className="ml-1 hidden border border-hot-pink px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-hot-pink sm:inline-block">
                AI Coach
              </span>
            </Link>

            {mounted && user && (
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-xs font-black uppercase tracking-[0.2em] text-silver-fox/60 hover:text-electric-yellow transition-colors border-b-2 border-transparent hover:border-electric-yellow pb-1"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/interview" 
                  className="text-xs font-black uppercase tracking-[0.2em] text-silver-fox/60 hover:text-hot-pink transition-colors border-b-2 border-transparent hover:border-hot-pink pb-1"
                >
                  Practice
                </Link>
              </nav>
            )}
          </div>

          {/* Auth Area */}
          <div className="flex items-center gap-3">
            {mounted && user ? (
              <UserMenu user={user} />
            ) : mounted ? (
              <button
                onClick={() => setShowAuth(true)}
                className="border-2 border-electric-yellow bg-electric-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-obsidian shadow-[3px_3px_0px_0px_#FF006E] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#FF006E] sm:px-5 sm:text-sm"
              >
                Sign In
              </button>
            ) : (
              /* SSR placeholder to avoid layout shift */
              <div className="h-[38px] w-[80px]" />
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
