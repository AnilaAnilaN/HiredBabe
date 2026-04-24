"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Step = "choose" | "otp-sent";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* close on backdrop click */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  /* ── Google OAuth ─────────────────────────────── */
  const handleGoogle = async () => {
    setLoading(true);
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  /* ── Email OTP ────────────────────────────────── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setSuccess("Check your email for the login link!");
    setStep("otp-sent");
    setLoading(false);
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="auth-modal-enter relative w-full max-w-md border-4 border-electric-yellow bg-obsidian p-6 shadow-[8px_8px_0px_0px_#FF006E] sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl font-black text-silver-fox/60 transition-colors hover:text-electric-yellow"
          aria-label="Close"
        >
          ×
        </button>

        {step === "choose" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-hot-pink">
                Join HiredBabe
              </p>
              <h2 className="text-2xl font-black text-electric-yellow sm:text-3xl">
                Sign In To Unlock More
              </h2>
              <p className="text-sm leading-6 text-silver-fox/70">
                Save your interview history to the cloud, track progress across
                devices, and unlock upcoming premium features.
              </p>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 border-4 border-silver-fox bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.15em] text-obsidian shadow-[4px_4px_0px_0px_#E0E0E0] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#E0E0E0] disabled:opacity-60"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue With Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-[2px] flex-1 bg-silver-fox/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-silver-fox/40">
                Or
              </span>
              <div className="h-[2px] flex-1 bg-silver-fox/20" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-silver-fox">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border-2 border-silver-fox bg-obsidian px-4 py-3 text-sm font-bold text-electric-yellow outline-none placeholder:text-silver-fox/30 focus:border-hot-pink"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-neo w-full disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="border border-hot-pink bg-hot-pink/10 p-3 text-sm leading-6 text-silver-fox">
                {error}
              </div>
            )}

            {/* Guest note */}
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-silver-fox/40">
              You can always use HiredBabe without signing in
            </p>
          </div>
        )}

        {step === "otp-sent" && (
          <div className="space-y-6 text-center">
            {/* Envelope icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center border-4 border-electric-yellow bg-electric-yellow/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-electric-yellow"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-electric-yellow">
                Check Your Inbox
              </h2>
              <p className="text-sm leading-6 text-silver-fox/70">
                We sent a magic link to{" "}
                <span className="font-bold text-hot-pink">{email}</span>. Click
                the link in the email to sign in.
              </p>
            </div>

            {success && (
              <div className="border border-electric-yellow bg-electric-yellow/10 p-3 text-sm leading-6 text-electric-yellow">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  setStep("choose");
                  setSuccess(null);
                  setError(null);
                }}
                className="w-full border-2 border-silver-fox px-6 py-3 text-sm font-black uppercase text-silver-fox transition-all hover:bg-silver-fox hover:text-obsidian"
              >
                Try Different Email
              </button>
              <button
                onClick={onClose}
                className="w-full text-sm font-bold text-silver-fox/50 transition-colors hover:text-silver-fox"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
