"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { LoveUpdate, formatRelativeDate, formatPercentageValue } from "@/types";
import { fetchLatestUpdate, fetchYesterdayUpdate } from "@/lib/storage";
import { AuthRole, setAuthenticatedSession } from "@/lib/auth";
import ProgressRing from "@/components/ProgressRing";
import AnimatedPercentage from "@/components/AnimatedPercentage";
import DynamicMessageDisplay from "@/components/DynamicMessage";
import PetalParticles from "@/components/PetalParticles";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  const router = useRouter();
  const [latestUpdate, setLatestUpdate] = useState<LoveUpdate | null>(null);
  const [yesterdayData, setYesterdayData] = useState<{
    percentage: number;
    message?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [latest, yday] = await Promise.all([
        fetchLatestUpdate(),
        fetchYesterdayUpdate(),
      ]);
      setLatestUpdate(latest);
      setYesterdayData(yday);
    } catch (e) {
      console.error("Failed to load latest feeling:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateClick = () => {
    // Open PIN prompt:
    // 1603 -> Trupti update page pops up
    // 0609 -> Admin page pops up
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (role: AuthRole) => {
    setIsAuthModalOpen(false);
    if (role) {
      setAuthenticatedSession(role);
    }
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/update");
    }
  };

  const percentage = latestUpdate ? latestUpdate.percentage : 78;
  const is100 = percentage === 100;
  const hasEntry = Boolean(latestUpdate);

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 sm:px-6 py-8 sm:py-14 selection:bg-[#EBC7CE] overflow-x-hidden">
      <PetalParticles isSpecial={is100} />

      {/* Top subtle branding with lotus */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="z-10 flex flex-col items-center pt-1 sm:pt-4"
      >
        <span
          className="text-3xl sm:text-4xl mb-1.5 animate-gentle-float select-none cursor-default"
          role="img"
          aria-label="lotus"
        >
          🪷
        </span>
        <h1 className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#7A7276] uppercase select-none">
          TRUPTI
        </h1>
      </motion.div>

      {/* Main Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 flex flex-col items-center my-auto py-4 sm:py-6"
      >
        <div className="relative flex items-center justify-center">
          <ProgressRing
            percentage={isLoading ? 0 : percentage}
            size={260}
            strokeWidth={3.5}
          >
            <div className="flex flex-col items-center justify-center">
              <AnimatedPercentage
                value={isLoading ? 0 : percentage}
                className="text-6xl sm:text-7xl font-normal"
              />
            </div>
          </ProgressRing>
        </div>

        <p className="mt-5 sm:mt-6 text-sm sm:text-base text-[#7A7276] text-center font-light tracking-wide max-w-xs px-2">
          how much do you love me right now?
        </p>

        <DynamicMessageDisplay percentage={percentage} className="mt-2" />

        <div className="mt-2 text-xs text-[#9B9499] tracking-wider font-medium">
          {latestUpdate
            ? formatRelativeDate(latestUpdate.created_at)
            : "Today's feeling"}
        </div>

        {/* Minimal Yesterday History Pill */}
        {yesterdayData && (
          <Link
            href="/history"
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7F8]/80 hover:bg-[#FFF7F8] border border-[#EBC7CE]/60 text-xs text-[#7A7276] shadow-xs backdrop-blur-xs transition-all hover:border-[#D88C9A] active:scale-95 group touch-manipulation"
          >
            <Clock size={11} className="text-[#D88C9A]" />
            <span>Yesterday</span>
            <span className="text-[#EBC7CE]">•</span>
            <span className="font-serif text-[#242124] font-medium group-hover:text-[#D88C9A] transition-colors">
              {formatPercentageValue(yesterdayData.percentage)}%
            </span>
          </Link>
        )}
      </motion.div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        className="z-10 flex flex-col items-center w-full max-w-xs gap-3 pb-2 sm:pb-4"
      >
        <button
          onClick={handleUpdateClick}
          className="w-full py-3.5 px-6 rounded-full bg-[#D88C9A] hover:bg-[#C97B89] active:scale-[0.98] text-white font-medium text-sm sm:text-base tracking-wide shadow-[0_4px_18px_rgba(216,140,154,0.35)] transition-all duration-200 cursor-pointer flex items-center justify-center group touch-manipulation"
        >
          <span>{hasEntry ? "Update my percentage" : "Set today's percentage"}</span>
        </button>

        <Link
          href="/history"
          className="text-xs sm:text-sm text-[#7A7276] hover:text-[#242124] tracking-wide py-1.5 border-b border-transparent hover:border-[#D88C9A] transition-all touch-manipulation"
        >
          See history
        </Link>
      </motion.div>

      {/* PIN Authentication Modal:
          Trupti PIN (1603) -> Opens /update
          Admin PIN (0609)  -> Opens /admin
      */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
