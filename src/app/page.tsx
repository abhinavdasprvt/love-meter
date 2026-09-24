"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active view: Abhinav 💙 vs Both 💕 vs Trupti 🌸
  const paramPerson = searchParams.get("person") as Person | null;
  const [activePerson, setActivePerson] = useState<Person>(
    paramPerson === "abhinav" || paramPerson === "both" ? paramPerson : "trupti"
  );

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

  // Sync activePerson from URL search params
  useEffect(() => {
    const p = searchParams.get("person") as Person | null;
    if (p && (p === "abhinav" || p === "trupti" || p === "both")) {
      setActivePerson(p);
    }
  }, [searchParams]);

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

  const handleUpdateClick = (target: Person = activePerson) => {
    const personToAuth = target === "both" ? "abhinav" : target;
    setAuthTargetPerson(personToAuth);
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
  const isBoth = activePerson === "both";
  const isTrupti = activePerson === "trupti";

  const abhinavPct = abhinavUpdate ? abhinavUpdate.percentage : 96.5;
  const truptiPct = truptiUpdate ? truptiUpdate.percentage : 78;
  const combinedPct = Math.round(((abhinavPct + truptiPct) / 2) * 10) / 10;

  const currentUpdate = isBoth
    ? null
    : isAbhinav
    ? abhinavUpdate
    : truptiUpdate;
  const currentYesterday = isBoth
    ? null
    : isAbhinav
    ? abhinavYesterday
    : truptiYesterday;
  const currentHistory = isBoth
    ? [...abhinavHistory, ...truptiHistory].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : isAbhinav
    ? abhinavHistory
    : truptiHistory;

  const percentage = isBoth
    ? combinedPct
    : currentUpdate
    ? currentUpdate.percentage
    : isAbhinav
    ? 96.5
    : 78;
  const is100 = percentage === 100;
  const hasEntry = Boolean(currentUpdate);

  // Dynamic Theme Colors
  const bgTheme = isBoth
    ? "bg-gradient-to-b from-[#F0F6FA] via-[#FAF5F7] to-[#F7F3F0]"
    : isAbhinav
    ? "bg-[#F0F6FA]"
    : "bg-[#F7F3F0]";
  const selectionTheme = isBoth
    ? "selection:bg-[#E9D5FF]"
    : isAbhinav
    ? "selection:bg-[#C3DDF7]"
    : "selection:bg-[#EBC7CE]";
  const accentButton = isBoth
    ? "bg-[#9333EA] hover:bg-[#7E22CE] shadow-[0_4px_18px_rgba(147,51,234,0.35)]"
    : isAbhinav
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
        {/* 3-way Person Segmented Toggle */}
        <div className="relative flex items-center p-1 rounded-full bg-white/80 backdrop-blur-md border border-black/5 shadow-xs w-full max-w-[310px] sm:max-w-[330px]">
          <button
            onClick={() => setActivePerson("abhinav")}
            className={`relative flex-1 py-1.5 px-2 rounded-full text-xs font-semibold tracking-wide transition-all z-10 flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
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
            onClick={() => setActivePerson("both")}
            className={`relative flex-1 py-1.5 px-2 rounded-full text-xs font-semibold tracking-wide transition-all z-10 flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
              isBoth ? "text-[#9333EA]" : "text-[#7A7276] hover:text-[#242124]"
            }`}
          >
            <span>Both</span>
            <span>💕</span>
            {isBoth && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-[#F3E8FF] rounded-full -z-10 border border-[#E9D5FF]/70 shadow-2xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => setActivePerson("trupti")}
            className={`relative flex-1 py-1.5 px-2 rounded-full text-xs font-semibold tracking-wide transition-all z-10 flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
              isTrupti ? "text-[#D88C9A]" : "text-[#7A7276] hover:text-[#242124]"
            }`}
          >
            <span>Trupti</span>
            <span>🌸</span>
            {isTrupti && (
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
            aria-label={isBoth ? "hearts" : isAbhinav ? "planet" : "lotus"}
          >
            {isBoth ? "🪐 💕 🪷" : isAbhinav ? "🪐" : "🪷"}
          </span>
          <h1 className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#7A7276] uppercase select-none">
            {isBoth ? "ABHINAV & TRUPTI" : isAbhinav ? "ABHINAV" : "TRUPTI"}
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
              theme={isBoth ? "purple" : isAbhinav ? "blue" : "pink"}
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
            {isBoth
              ? "our combined love harmony today"
              : isAbhinav
              ? "how much do I love my girl today?"
              : "how much do you love me right now?"}
          </p>

          <DynamicMessageDisplay
            percentage={percentage}
            person={activePerson}
            className="mt-1"
          />

          {isBoth ? (
            <div className="w-full grid grid-cols-2 gap-2 mt-3 max-w-xs">
              <div className="p-2.5 rounded-2xl bg-white/80 border border-[#C3DDF7] text-left shadow-2xs">
                <div className="text-[10px] text-[#3B7CD8] font-bold tracking-wider">ABHINAV 💙</div>
                <div className="text-base font-serif text-[#242124]">{formatPercentageValue(abhinavPct)}%</div>
                <div className="text-[10px] text-[#7A7276] line-clamp-1 italic mt-0.5">{abhinavUpdate?.message || "Madly in love ✨"}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/80 border border-[#EBC7CE] text-left shadow-2xs">
                <div className="text-[10px] text-[#D88C9A] font-bold tracking-wider">TRUPTI 🌸</div>
                <div className="text-base font-serif text-[#242124]">{formatPercentageValue(truptiPct)}%</div>
                <div className="text-[10px] text-[#7A7276] line-clamp-1 italic mt-0.5">{truptiUpdate?.message || "Best boy ever ✨"}</div>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-xs text-[#9B9499] tracking-wider font-medium">
              {currentUpdate
                ? formatRelativeDate(currentUpdate.created_at)
                : "Today's feeling"}
            </div>
          )}

          {/* Minimal Yesterday History Pill */}
          {!isBoth && currentYesterday && (
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
            theme={isBoth ? "pink" : isAbhinav ? "blue" : "pink"}
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
        {isBoth ? (
          <div className="w-full flex items-center gap-2">
            <button
              onClick={() => handleUpdateClick("abhinav")}
              className="flex-1 py-3 px-3 rounded-full bg-[#4A88E8] hover:bg-[#3B7CD8] active:scale-[0.98] text-white font-medium text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
            >
              <span>Update Abhinav</span>
              <span>💙</span>
            </button>
            <button
              onClick={() => handleUpdateClick("trupti")}
              className="flex-1 py-3 px-3 rounded-full bg-[#D88C9A] hover:bg-[#C97B89] active:scale-[0.98] text-white font-medium text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
            >
              <span>Update Trupti</span>
              <span>🌸</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleUpdateClick(activePerson)}
            className={`w-full py-3.5 px-6 rounded-full ${accentButton} active:scale-[0.98] text-white font-medium text-sm sm:text-base tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center group touch-manipulation`}
          >
            <span>
              {hasEntry
                ? `Update ${isAbhinav ? "Abhinav's" : "Trupti's"} percentage`
                : `Set ${isAbhinav ? "Abhinav's" : "today's"} percentage`}
            </span>
          </button>
        )}

        <div className="flex items-center justify-center text-xs sm:text-sm text-[#7A7276]">
          <Link
            href={isBoth ? "/history" : `/history?person=${activePerson}`}
            className="hover:text-[#242124] tracking-wide py-1 border-b border-transparent hover:border-current transition-all touch-manipulation"
          >
            See {isBoth ? "all memories" : isAbhinav ? "Abhinav's" : "Trupti's"} history
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDF9F6]" />}>
      <HomeContent />
    </Suspense>
  );
}
