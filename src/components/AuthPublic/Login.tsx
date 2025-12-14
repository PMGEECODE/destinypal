"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { validateEmail } from "./utils/validation";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

import Logo from "../logo/Logo";

interface LoginProps {
  onForgotPassword?: () => void;
  onRegister?: () => void;
  onSuccess?: () => void;
  onTwoFactorRequired?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToLanding?: () => void;
}

const CAROUSEL_IMAGES = [
  "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/4589881/pexels-photo-4589881.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/7974170/pexels-photo-7974170.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
];

export function Login({
  onForgotPassword,
  onRegister,
  onSuccess,
  onTwoFactorRequired,
  onNavigateToTerms,
  onNavigateToPrivacy,
}: LoginProps) {
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    if (!email.trim()) return setFormError("Email is required");
    if (!validateEmail(email))
      return setFormError("Please enter a valid email address");
    if (!password) return setFormError("Password is required");

    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor) onTwoFactorRequired?.();
      else onSuccess?.();
    } catch (err: any) {
      setFormError(err.message || "Login failed. Please try again.");
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-end relative overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {CAROUSEL_IMAGES.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt="Education & opportunity"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
              idx === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/70 to-transparent" />
      </div>

      {/* Hero Text */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="max-w-2xl pl-8 sm:pl-12 lg:pl-20 text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Welcome to <span className="text-yellow-400">DestinyPal</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-gray-100 font-light">
            Connecting students with opportunity through institutions and
            sponsors
          </p>
          <p className="mt-10 sm:mt-12 text-2xl sm:text-3xl lg:text-4xl font-bold">
            Your support creates lasting change
          </p>
        </div>
      </div>

      {/* Floating Logo */}
      <div className="absolute top-2 left-8 sm:top-12 sm:left-12 lg:top-20 lg:left-20 w-16 h-16 z-20 pointer-events-auto">
        <Logo variant="destinypal" className="w-full h-full" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 lg:mx-12 lg:mr-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-200">
          {/* Header */}

          <div className="text-center mb-8">
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="text-gray-600 mt-1">Sign in to continue</p>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold text-slate-900">Sign in</h2>
              <p className="text-gray-600 text-sm">Continue making an impact</p>
            </div>
          </div>

          {/* Error */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-slate-700 rounded border-gray-300 focus:ring-slate-700"
                  disabled={isLoading}
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-slate-700 hover:text-slate-800 font-medium transition-colors"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-yellow-400 font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={onRegister}
              className="font-medium text-slate-700 hover:text-slate-800 transition-colors"
            >
              Create one
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <button
              onClick={onNavigateToTerms}
              className="text-slate-700 hover:text-slate-800 hover:underline transition-colors"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              onClick={onNavigateToPrivacy}
              className="text-slate-700 hover:text-slate-800 hover:underline transition-colors"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
