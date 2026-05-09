"use client";

import { useState } from "react";
import { MailX, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Pre-fill email from URL params (client-side only)
  useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) setEmail(emailParam);
    }
  });

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You have been successfully unsubscribed. You will no longer receive emails from us.");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="py-20 sm:py-28">
      <div className="section-container max-w-lg mx-auto">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-800 border border-surface-700 mx-auto">
            <MailX className="w-8 h-8 text-surface-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Unsubscribe
          </h1>
          <p className="text-surface-400 text-lg">
            Sorry to see you go. Enter your email below to unsubscribe from our newsletter.
          </p>
        </div>

        {status === "success" ? (
          <div className="card p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600/10 border border-green-600/30 mx-auto">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Unsubscribed</h2>
            <p className="text-surface-400">{message}</p>
            <p className="text-surface-500 text-sm">
              Changed your mind?{" "}
              <button
                onClick={() => {
                  setStatus("idle");
                  setMessage("");
                }}
                className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
              >
                Re-subscribe
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="card p-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-surface-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700
                           text-white placeholder-surface-500 focus:outline-none focus:ring-2
                           focus:ring-brand-500 focus:border-transparent transition-colors"
              />
            </div>

            {status === "error" && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-600/10 border border-red-600/30">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="w-full py-3 px-6 rounded-lg bg-surface-700 hover:bg-surface-600
                         text-white font-medium transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Unsubscribing...
                </>
              ) : (
                "Unsubscribe"
              )}
            </button>

            <p className="text-surface-500 text-xs text-center">
              This will remove your email from all future newsletters and email broadcasts.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
