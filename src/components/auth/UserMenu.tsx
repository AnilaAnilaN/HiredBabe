"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl = user.user_metadata?.avatar_url || null;
  const initial = displayName.charAt(0).toUpperCase();

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border-2 border-electric-yellow/60 bg-obsidian px-3 py-2 transition-all hover:border-electric-yellow hover:shadow-[2px_2px_0px_0px_#FF006E]"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={28}
            height={28}
            className="h-7 w-7 border border-electric-yellow object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center border border-electric-yellow bg-electric-yellow/20 text-xs font-black text-electric-yellow">
            {initial}
          </div>
        )}
        <span className="hidden max-w-[120px] truncate text-xs font-bold uppercase tracking-wider text-silver-fox sm:block">
          {displayName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 text-silver-fox/60 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="user-menu-enter absolute right-0 top-full z-50 mt-2 w-64 border-4 border-electric-yellow bg-obsidian shadow-[6px_6px_0px_0px_#FF006E]">
          {/* User Info */}
          <div className="border-b-2 border-silver-fox/20 p-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="h-8 w-8 border border-electric-yellow object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center border-2 border-electric-yellow bg-electric-yellow/20 text-sm font-black text-electric-yellow">
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-electric-yellow">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-silver-fox/60">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-bold uppercase tracking-wider text-silver-fox transition-all hover:bg-electric-yellow/10 hover:text-electric-yellow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              My Dashboard
            </Link>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-bold uppercase tracking-wider text-silver-fox transition-all hover:bg-hot-pink/10 hover:text-hot-pink"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
