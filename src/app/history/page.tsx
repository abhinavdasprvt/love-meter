"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  MessageSquareHeart,
  Clock,
  Sparkles,
} from "lucide-react";
import { fetchAllUpdates } from "@/lib/storage";
import {
  LoveUpdate,
  Person,
  formatHistoryDate,
  formatPercentageValue,
} from "@/types";
import HistoryGraph from "@/components/HistoryGraph";
import PetalParticles from "@/components/PetalParticles";

function HistoryPageContent() {
  const searchParams = useSearchParams();
  const initialPerson = searchParams.get("person") as Person | null;

  const [activeFilter, setActiveFilter] = useState<"all" | "abhinav" | "trupti">(
    initialPerson || "all"
  );
  const [updates, setUpdates] = useState<LoveUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllUpdates();
        setUpdates(data);
      } catch (e) {
        console.error("Failed to load history:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredUpdates =
    activeFilter === "all"
      ? updates
      : updates.filter((u) => u.person === activeFilter);

  const isAbhinavActive = activeFilter === "abhinav";
  const bgTheme = isAbhinavActive ? "bg-[#F0F6FA]" : "bg-[#F7F3F0]";

  return (
    <main
      className={`relative min-h-[100dvh] w-full flex flex-col items-center px-4 sm:px-6 py-6 sm:py-12 ${bgTheme} selection:bg-[#EBC7CE] transition-colors duration-500 overflow-x-hidden`}
    >
      <PetalParticles
        theme={activeFilter === "abhinav" ? "blue" : "pink"}
      />

      {/* Top Header */}
      <div className="z-10 w-full max-w-sm sm:max-w-md flex items-center justify-between mb-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#7A7276] hover:text-[#242124] transition-colors py-2 px-1 group touch-manipulation"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Home</span>
        </Link>
        <span className="text-xl select-none" role="img" aria-label="icon">
          {activeFilter === "abhinav" ? "🪐" : "🪷"}
        </span>
        <div className="w-12" />
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-sm sm:max-w-md text-center mb-3"
      >
        <h1 className="text-2xl sm:text-3xl font-serif text-[#242124]">
          Day-by-Day Memory Lane
        </h1>
        <p className="text-xs text-[#7A7276] mt-1 tracking-wide">
          Every day&apos;s feeling, safely kept here forever ♡
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="z-10 flex items-center p-1 rounded-full bg-white/80 border border-black/5 shadow-2xs mb-4">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "all"
              ? "bg-[#242124] text-white shadow-2xs"
              : "text-[#7A7276] hover:text-[#242124]"
          }`}
        >
          All Memories
        </button>
        <button
          onClick={() => setActiveFilter("abhinav")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "abhinav"
              ? "bg-[#4A88E8] text-white shadow-2xs"
              : "text-[#7A7276] hover:text-[#242124]"
          }`}
        >
          Abhinav 💙
        </button>
        <button
          onClick={() => setActiveFilter("trupti")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === "trupti"
              ? "bg-[#D88C9A] text-white shadow-2xs"
              : "text-[#7A7276] hover:text-[#242124]"
          }`}
        >
          Trupti 🌸
        </button>
      </div>

      {/* History Line Graph */}
      {!isLoading && filteredUpdates.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
          className="z-10 w-full max-w-sm sm:max-w-md"
        >
          <HistoryGraph updates={filteredUpdates} />
        </motion.div>
      )}

      {/* Day by Day Entries List */}
      <div className="z-10 w-full max-w-sm sm:max-w-md flex flex-col gap-3.5 mt-2 mb-10">
        {isLoading ? (
          <div className="text-center py-16 text-sm text-[#7A7276] animate-pulse">
            Gathering memories day by day...
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#7A7276] font-light">
            No feelings recorded for this view yet.
            <div className="mt-3">
              <Link
                href="/update"
                className="text-xs text-[#D88C9A] underline hover:text-[#C97B89] touch-manipulation"
              >
                Record a feeling today
              </Link>
            </div>
          </div>
        ) : (
          filteredUpdates.map((entry, index) => {
            const dateInfo = formatHistoryDate(entry.created_at);
            const isEntry100 = entry.percentage === 100;
            const isEntryAbhinav = entry.person === "abhinav";

            const cardBorder = isEntryAbhinav
              ? "border-[#C3DDF7]"
              : isEntry100
              ? "border-[#D88C9A]/70"
              : "border-[#EBC7CE]/40";
            const cardBg = isEntryAbhinav
              ? "bg-[#F0F7FD]/90"
              : isEntry100
              ? "bg-gradient-to-br from-[#FFF7F8] to-[#FFF0F3]"
              : "bg-[#FFF7F8]/90";
            const badgeBg = isEntryAbhinav
              ? "bg-[#E0EEFC] text-[#3B7CD8]"
              : "bg-[#FFEBF0] text-[#D88C9A]";

            return (
              <motion.div
                key={entry.id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`w-full rounded-2xl ${cardBg} border ${cardBorder} p-4 shadow-xs backdrop-blur-xs flex flex-col gap-2 transition-all hover:border-[#D88C9A]/60`}
              >
                {/* Header row: Person badge + Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${badgeBg}`}
                    >
                      {isEntryAbhinav ? "Abhinav 💙" : "Trupti 🌸"}
                    </span>
                    <span className="text-xs font-medium text-[#242124]">
                      {dateInfo.main}
                    </span>
                  </div>

                  {dateInfo.sub && (
                    <div className="flex items-center gap-1 text-[11px] text-[#9B9499]">
                      <Clock size={10} />
                      <span>{dateInfo.sub}</span>
                    </div>
                  )}
                </div>

                {/* Score & Note */}
                <div className="flex items-baseline justify-between gap-2 mt-1">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl sm:text-3xl font-serif text-[#242124] ${
                        isEntry100 ? "text-[#D88C9A] font-semibold" : ""
                      }`}
                    >
                      {formatPercentageValue(entry.percentage)}
                    </span>
                    <span className="text-xs text-[#7A7276]">%</span>
                  </div>

                  {isEntry100 && (
                    <span className="text-xs text-[#D88C9A] flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>100% Love</span>
                    </span>
                  )}
                </div>

                {/* Optional Message */}
                {entry.message && (
                  <div className="mt-1 pt-2 border-t border-black/5 flex items-start gap-2 text-xs text-[#6E676C] font-light leading-relaxed">
                    <MessageSquareHeart
                      size={13}
                      className="text-[#D88C9A] shrink-0 mt-0.5"
                    />
                    <span className="italic break-words">&ldquo;{entry.message}&rdquo;</span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer Navigation */}
      <div className="z-10 mt-auto pb-4">
        <Link
          href="/"
          className="text-xs text-[#7A7276] hover:text-[#242124] tracking-wide transition-colors py-2 px-4 rounded-full bg-white/60 hover:bg-white border border-black/5 shadow-2xs"
        >
          ← Return to Today
        </Link>
      </div>
    </main>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-[#7A7276] animate-pulse">
          Loading memories...
        </div>
      }
    >
      <HistoryPageContent />
    </Suspense>
  );
}
