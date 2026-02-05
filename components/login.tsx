"use client";

import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { toast } from "react-toastify";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

interface LoginProps {
  onBack: () => void;
  onSuccess: (username: string) => void;
}

export function Login({ onBack, onSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (passcode.length !== 6 || !/^\d+$/.test(passcode)) {
      toast.error("Passcode must be exactly 6 digits");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(username, passcode);
      if (result.success) {
        toast.success("Logged in successfully!");
        onSuccess(username.toLowerCase().trim());
      } else {
        toast.error(result.error || "Invalid username or passcode");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-md px-4 sm:px-0">
      <button
        type="button"
        onClick={onBack}
        className="text-foreground mb-6 flex items-center gap-2 transition-colors hover:text-white/90"
      >
        <FiArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="bg-card/95 rounded-2xl border border-white/20 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold">
          Welcome Back
        </h1>
        <p className="text-muted-foreground mb-6">Login to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="text-foreground mb-2 block text-sm font-medium"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-background/80 border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-xl border px-4 py-2.5 transition-all duration-200 focus:ring-2 focus:outline-none"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="passcode"
              className="text-foreground mb-2 block text-sm font-medium"
            >
              Passcode (6 digits)
            </label>
            <div className="relative">
              <input
                id="passcode"
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) =>
                  setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="bg-background/80 border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-xl border px-4 py-2.5 pr-10 transition-all duration-200 focus:ring-2 focus:outline-none"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                {showPasscode ? (
                  <FiEyeOff className="h-5 w-5" />
                ) : (
                  <FiEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground mt-6 w-full rounded-xl py-3 font-semibold transition-all duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
