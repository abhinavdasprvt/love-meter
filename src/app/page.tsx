"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import {
  LoveUpdate,
  Person,
  formatRelativeDate,
  formatPercentageValue,
} from "@/types";
import {
  fetchLatestUpdate,
  fetchYesterdayUpdate,
  fetchAllUpdates,
} from "@/lib/storage";
import { AuthRole, setAuthenticatedSession } from "@/lib/auth";
import ProgressRing from "@/components/ProgressRing";
import AnimatedPercentage from "@/components/AnimatedPercentage";
import DynamicMessageDisplay from "@/components/DynamicMessage";
import PetalParticles from "@/components/PetalParticles";
import AuthModal from "@/components/AuthModal";
import LoveAnalysisModal from "@/components/LoveAnalysisModal";
import FunnyInteractions from "@/components/FunnyInteractions";
import HistoryGraph from "@/components/HistoryGraph";

export default function HomePage() {
  const router = useRouter();

  // Active view: Abhinav 💙 vs Trupti 🌸
  const [activePerson, setActivePerson] = useState<Person>("trupti");

  // State for both Abhinav and Trupti data
  const [truptiUpdate, setTruptiUpdate] = useState<LoveUpdate | null>(null);
  const [truptiYesterday, setTruptiYesterday] = useState<{
    percentage: number;
    message?: string | null;
  } | null>(null);
  const [truptiHistory, setTruptiHistory] = useState<LoveUpdate[]>([]);

  const [abhinavUpdate, setAbhinavUpdate] = useState<LoveUpdate | null>(null);
  const [abhinavYesterday, setAbhinavYesterday] = useState<{
    percentage: number;
    message?: string | null;
  } | null>(null);
  const [abhinavHistory, setAbhinavHistory] = useState<LoveUpdate[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authTargetPerson, setAuthTargetPerson] = useState<Person | "admin">("trupti");
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [tLatest, tYday, aLatest, aYday, tHist, aHist] = await Promise.all([
        fetchLatestUpdate("trupti"),
        fetchYesterdayUpdate("trupti"),
        fetchLatestUpdate("abhinav"),
        fetchYesterdayUpdate("abhinav"),
        fetchAllUpdates("trupti"),
        fetchAllUpdates("abhinav"),
      ]);

      setTruptiUpdate(tLatest);
      setTruptiYesterday(tYday);
      setTruptiHistory(tHist);

      setAbhinavUpdate(aLatest);
      setAbhinavYesterday(aYday);
      setAbhinavHistory(aHist);
    } catch (e) {
      console.error("Failed to load love feelings:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateClick = () => {
    setAuthTargetPerson(activePerson);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (role: AuthRole) => {
    setIsAuthModalOpen(false);
    if (role) {
      setAuthenticatedSession(role);
    }

    if (role === "admin") {
      router.push("/admin");
    } else if (role === "abhinav") {
      router.push("/update?person=abhinav");
    } else {
      router.push("/update?person=trupti");
    }
  };

  const isAbhinav = activePerson === "abhinav";
  const currentUpdate = isAbhinav ? abhinavUpdate : truptiUpdate;
  const currentYesterday = isAbhinav ? abhinavYesterday : truptiYesterday;
  const currentHistory = isAbhinav ? abhinavHistory : truptiHistory;

  const defaultPct = isAbhinav ? 96.5 : 78;
  const percentage = currentUpdate ? currentUpdate.percentage : defaultPct;
  const is100 = percentage === 100;
  const hasEntry = Boolean(currentUpdate);

  // Dynamic Theme Colors
  const bgTheme = isAbhinav ? "bg-[#F0F6FA]" : "bg-[#F7F3F0]";
  const selectionTheme = isAbhinav
    ? "selection:bg-[#C3DDF7]"
    : "selection:bg-[#EBC7CE]";
  const accentButton = isAbhinav
    ? "bg-[#4A88E8] hover:bg-[#3B7CD8] shadow-[0_4px_18px_rgba(74,136,232,0.35)]"
    : "bg-[#D88C9A] hover:bg-[#C97B89] shadow-[0_4px_18px_rgba(216,140,154,0.35)]";

  return (
    <main
      className={`relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-3.5 sm:px-6 py-5 sm:py-8 md:py-10 ${bgTheme} ${selectionTheme} transition-colors duration-700 overflow-x-hidden`}
    >
      <PetalParticles isSpecial={is100} person={activePerson} />

      {/* Top Header & Person Selector */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 flex flex-col items-center gap-2.5 w-full max-w-sm sm:max-w-md pt-1"
      >
        {/* Person Segmented Toggle */}
        <div className="relative flex items-center p-1 rounded-full bg-white/80 backdrop-blur-md border border-black/5 shadow-xs w-full max-w-[270px] sm:max-w-[290px]">
          <button
            onClick={() => setActivePerson("abhinav")}
            className={`relative flex-1 py-1.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all z-10 flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              isAbhinav ? "text-[#3B7CD8]" : "text-[#7A7276] hover:text-[#242124]"
            }`}
          >
            <span>Abhinav</span>
            <span>💙</span>
            {isAbhinav && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-[#E8F2FC] rounded-full -z-10 border border-[#C3DDF7]/70 shadow-2xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => setActivePerson("trupti")}
            className={`relative flex-1 py-1.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all z-10 flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              !isAbhinav ? "text-[#D88C9A]" : "text-[#7A7276] hover:text-[#242124]"
            }`}
          >
            <span>Trupti</span>
            <span>🌸</span>
            {!isAbhinav && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-[#FFF0F3] rounded-full -z-10 border border-[#EBC7CE]/70 shadow-2xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>

        {/* Our Love Analysis Pill Button */}
        <button
          onClick={() => setIsAnalysisModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 hover:bg-white border border-[#EBC7CE]/60 text-[11px] font-medium text-[#7A7276] hover:text-[#242124] shadow-2xs backdrop-blur-xs transition-all active:scale-95 cursor-pointer touch-manipulation group"
        >
          <Sparkles size={11} className="text-[#D88C9A] group-hover:rotate-12 transition-transform" />
          <span>Our Love Analysis</span>
          <span className="text-[10px] text-[#D88C9A] font-semibold">✨</span>
        </button>

        {/* Dynamic Name and Floating Icon */}
        <div className="flex flex-col items-center mt-0.5">
          <span
            className="text-3xl sm:text-4xl mb-0.5 animate-gentle-float select-none cursor-default"
            role="img"
            aria-label={isAbhinav ? "planet" : "lotus"}
          >
            {isAbhinav ? "🪐" : "🪷"}
          </span>
          <h1 className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#7A7276] uppercase select-none">
            {isAbhinav ? "ABHINAV" : "TRUPTI"}
          </h1>
        </div>
      </motion.div>

      {/* Main Responsive Container: Centers on phone, 2-column or spacious grid on laptop/PC */}
      <div className="z-10 w-full max-w-sm sm:max-w-md lg:max-w-4xl my-auto py-2 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
        {/* Left / Center Column: Progress Ring & Daily Feeling */}
        <motion.div
          key={activePerson}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full max-w-sm"
        >
          {/* Progress Ring with Responsive Size */}
          <div className="relative flex items-center justify-center">
            <ProgressRing
              percentage={isLoading ? 0 : percentage}
              size={240}
              strokeWidth={3.5}
              theme={isAbhinav ? "blue" : "pink"}
            >
              <div className="flex flex-col items-center justify-center">
                <AnimatedPercentage
                  value={isLoading ? 0 : percentage}
                  className="text-6xl sm:text-7xl font-normal"
                />
              </div>
            </ProgressRing>
          </div>

          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-[#7A7276] text-center font-light tracking-wide max-w-xs px-2">
            {isAbhinav
              ? "how much do I love my girl today?"
              : "how much do you love me right now?"}
          </p>

          <DynamicMessageDisplay
            percentage={percentage}
            person={activePerson}
            className="mt-1"
          />

          <div className="mt-1 text-xs text-[#9B9499] tracking-wider font-medium">
            {currentUpdate
              ? formatRelativeDate(currentUpdate.created_at)
              : "Today's feeling"}
          </div>

          {/* Minimal Yesterday History Pill */}
          {currentYesterday && (
            <Link
              href={`/history?person=${activePerson}`}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 hover:bg-white border border-black/5 text-xs text-[#7A7276] shadow-2xs backdrop-blur-xs transition-all active:scale-95 group touch-manipulation"
            >
              <Clock
                size={11}
                className={isAbhinav ? "text-[#4A88E8]" : "text-[#D88C9A]"}
              />
              <span>Yesterday</span>
              <span>•</span>
              <span className="font-serif text-[#242124] font-medium transition-colors">
                {formatPercentageValue(currentYesterday.percentage)}%
              </span>
            </Link>
          )}

          {/* Funny & Love Interactions Widget */}
          <FunnyInteractions person={activePerson} />
        </motion.div>

        {/* Right Column (or Stacked on Mobile): LOVE LATELY Graph */}
        <motion.div
          key={`graph-${activePerson}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-sm sm:max-w-md flex flex-col items-center"
        >
          <HistoryGraph
            updates={currentHistory}
            person={activePerson}
            theme={isAbhinav ? "blue" : "pink"}
            className="w-full shadow-sm"
          />
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="z-10 flex flex-col items-center w-full max-w-xs gap-2 pt-2 pb-1"
      >
        <button
          onClick={handleUpdateClick}
          className={`w-full py-3.5 px-6 rounded-full ${accentButton} active:scale-[0.98] text-white font-medium text-sm sm:text-base tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center group touch-manipulation`}
        >
          <span>
            {hasEntry
              ? `Update ${isAbhinav ? "Abhinav's" : "Trupti's"} percentage`
              : `Set ${isAbhinav ? "Abhinav's" : "today's"} percentage`}
          </span>
        </button>

        <div className="flex items-center justify-center text-xs sm:text-sm text-[#7A7276]">
          <Link
            href={`/history?person=${activePerson}`}
            className="hover:text-[#242124] tracking-wide py-1 border-b border-transparent hover:border-current transition-all touch-manipulation"
          >
            See {isAbhinav ? "Abhinav's" : "Trupti's"} history
          </Link>
        </div>
      </motion.div>

      {/* PIN Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        targetPerson={authTargetPerson}
      />

      {/* Our Love Analysis Modal */}
      <LoveAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        abhinavUpdate={abhinavUpdate}
        truptiUpdate={truptiUpdate}
      />
    </main>
  );
}
