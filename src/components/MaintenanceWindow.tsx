"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lock,
  RefreshCw,
  CheckCircle2,
  Clock,
  Heart,
} from "lucide-react";
import { MaintenanceConfig, DEFAULT_MAINTENANCE_CONFIG } from "@/types";
import {
  fetchMaintenanceConfig,
  isMaintenanceBypassed,
  setMaintenanceBypass,
} from "@/lib/maintenance";
import { AuthRole, getAuthenticatedRole } from "@/lib/auth";
import PetalParticles from "@/components/PetalParticles";
import AuthModal from "@/components/AuthModal";

interface MaintenanceWindowProps {
  onBypassChange?: (bypassed: boolean) => void;
}

export default function MaintenanceWindow({ onBypassChange }: MaintenanceWindowProps) {
  const router = useRouter();
  const [config, setConfig] = useState<MaintenanceConfig>(DEFAULT_MAINTENANCE_CONFIG);
  const [isBypassed, setIsBypassed] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [hasCheckedInit, setHasCheckedInit] = useState<boolean>(false);

  const refreshState = useCallback(async () => {
    try {
      const bypassed = isMaintenanceBypassed() || getAuthenticatedRole() === "admin";
      setIsBypassed(bypassed);

      const latestConfig = await fetchMaintenanceConfig();
      setConfig(latestConfig);
    } catch (e) {
      console.error("Failed to load maintenance state:", e);
    } finally {
      setHasCheckedInit(true);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setStatusFeedback(null);

    try {
      const updated = await fetchMaintenanceConfig();
      setConfig(updated);
      await new Promise((r) => setTimeout(r, 600));

      if (!updated.enabled) {
        setStatusFeedback("Maintenance completed! Site is now fully open ✨");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setStatusFeedback("All systems healthy. We're in the final polishing touches! 🌸");
        setTimeout(() => setStatusFeedback(null), 4000);
      }
    } catch {
      setStatusFeedback("Checked: System active & updates in progress ♡");
      setTimeout(() => setStatusFeedback(null), 3000);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleAuthSuccess = (role: AuthRole) => {
    setIsAuthModalOpen(false);
    setMaintenanceBypass(true);
    setIsBypassed(true);
    if (onBypassChange) onBypassChange(true);

    if (role === "admin") {
      router.push("/admin");
    }
  };

  // If maintenance is completely disabled, or if user is authenticated/bypassed, don't show anything
  if (!config.enabled || isBypassed) {
    return null;
  }

  // Active Maintenance Window Overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#F7F3F0]/92 backdrop-blur-md overflow-y-auto selection:bg-[#EBC7CE]">
      <PetalParticles />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-3xl bg-[#FFF7F8]/95 border border-[#EBC7CE] shadow-[0_20px_50px_rgba(216,140,154,0.25)] p-6 sm:p-9 flex flex-col items-center text-center my-auto overflow-hidden"
      >
        {/* Subtle decorative glowing corner aura */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#EBC7CE]/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#D88C9A]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Floating Lotus */}
        <div
          className="text-4xl sm:text-5xl mb-3 animate-gentle-float select-none cursor-default"
          role="img"
          aria-label="lotus"
        >
          🪷
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#EBC7CE] text-[11px] font-semibold tracking-wider text-[#D88C9A] uppercase mb-3 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D88C9A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D88C9A]"></span>
          </span>
          <span>Scheduled Maintenance Window</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-serif text-[#242124] leading-tight">
          {config.title || "Polishing Things Up ✨"}
        </h2>

        {/* Message */}
        <p className="mt-3 text-xs sm:text-sm text-[#7A7276] font-light leading-relaxed max-w-sm">
          {config.message ||
            "We're currently fine-tuning our little love meter to make everything smoother, sweeter, and more magical. We'll be back online very shortly!"}
        </p>

        {/* Progress & Live Work Card */}
        <div className="w-full mt-6 p-4 rounded-2xl bg-white/70 border border-[#EBC7CE]/60 shadow-2xs text-left">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-[#242124] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#D88C9A]" />
              Window Progress
            </span>
            <span className="font-semibold text-[#D88C9A]">88% Complete</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#EBC7CE]/30 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: "30%" }}
              animate={{ width: "88%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#EBC7CE] to-[#D88C9A] rounded-full"
            />
          </div>

          {/* Highlight bullets */}
          <div className="mt-3.5 space-y-2 text-[11px] text-[#7A7276]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-[#D88C9A] shrink-0" />
              <span>Sweet animations & petal physics calibrated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-[#D88C9A] shrink-0" />
              <span>Database sync & memory lane optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-[#D88C9A] shrink-0" />
              <span>Final checks & love notes verification in progress</span>
            </div>
          </div>

          {/* Estimated Return */}
          {config.estimatedReturn && (
            <div className="mt-3 pt-2.5 border-t border-[#EBC7CE]/40 flex items-center justify-between text-[11px]">
              <span className="text-[#9B9499]">Estimated Return</span>
              <span className="font-medium text-[#242124]">
                {config.estimatedReturn}
              </span>
            </div>
          )}
        </div>

        {/* Status check feedback toast */}
        <AnimatePresence>
          {statusFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-3 text-xs text-[#242124] bg-[#FFF0F3] border border-[#EBC7CE] px-3.5 py-1.5 rounded-full shadow-2xs font-medium"
            >
              {statusFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="w-full mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleCheckStatus}
            disabled={isCheckingStatus}
            className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#D88C9A] hover:bg-[#C97B89] active:scale-[0.98] text-white font-medium text-xs sm:text-sm tracking-wide shadow-[0_4px_16px_rgba(216,140,154,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation disabled:opacity-70"
          >
            <RefreshCw
              size={14}
              className={isCheckingStatus ? "animate-spin" : ""}
            />
            <span>{isCheckingStatus ? "Checking status..." : "Check Live Status"}</span>
          </button>

          {config.allowBypass !== false && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto py-3 px-4 rounded-full bg-white/80 hover:bg-white text-[#7A7276] hover:text-[#242124] text-xs font-medium border border-[#EBC7CE]/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation shadow-2xs"
            >
              <Lock size={12} className="text-[#D88C9A]" />
              <span>Owner Access</span>
            </button>
          )}
        </div>

        {/* Footer Note */}
        <p className="mt-4 text-[11px] text-[#9B9499] flex items-center gap-1">
          <span>Made with</span>
          <Heart size={10} className="fill-[#D88C9A] text-[#D88C9A] inline" />
          <span>for TRUPTI</span>
        </p>
      </motion.div>

      {/* Secret PIN Modal for Bypass */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
