"use client";

import React, { useEffect, useState } from "react";
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
import { LoveUpdate, formatHistoryDate, formatPercentageValue } from "@/types";
import HistoryGraph from "@/components/HistoryGraph";
import PetalParticles from "@/components/PetalParticles";

export default function HistoryPage() {
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

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center px-4 sm:px-6 py-6 sm:py-12 selection:bg-[#EBC7CE] overflow-x-hidden">
      <PetalParticles />

      {/* Top Header */}
      <div className="z-10 w-full max-w-sm sm:max-w-md flex items-center justify-between mb-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#7A7276] hover:text-[#242124] transition-colors py-2 px-1 group touch-manipulation"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Today</span>
        </Link>
        <span className="text-xl select-none" role="img" aria-label="lotus">
          🪷
        </span>
        <div className="w-12" />
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-sm sm:max-w-md text-center mb-4"
      >
        <h1 className="text-2xl sm:text-3xl font-serif text-[#242124]">
          Day-by-Day History
        </h1>
        <p className="text-xs text-[#7A7276] mt-1 tracking-wide">
          Every day&apos;s feeling, kept gently here from today onwards ♡
        </p>
      </motion.div>

      {/* History Line Graph (if 2 or more entries exist) */}
      {!isLoading && updates.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
          className="z-10 w-full max-w-sm sm:max-w-md"
        >
          <HistoryGraph updates={updates} />
        </motion.div>
      )}

      {/* Day by Day Entries List */}
      <div className="z-10 w-full max-w-sm sm:max-w-md flex flex-col gap-3.5 mt-2 mb-10">
        {isLoading ? (
          <div className="text-center py-16 text-sm text-[#7A7276] animate-pulse">
            Gathering memories day by day...
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#7A7276] font-light">
            No feelings recorded yet.
            <div className="mt-3">
              <Link
                href="/update"
                className="text-xs text-[#D88C9A] underline hover:text-[#C97B89] touch-manipulation"
              >
                Record your first feeling today
              </Link>
            </div>
          </div>
        ) : (
          updates.map((entry, index) => {
            const dateInfo = formatHistoryDate(entry.created_at);
            const isToday = dateInfo.main === "Today";
            const isYesterday = dateInfo.main === "Yesterday";
            const is100 = entry.percentage === 100;

            return (
              <motion.div
                key={entry.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`w-full rounded-2xl p-4 sm:p-5 shadow-xs backdrop-blur-xs flex flex-col gap-2.5 transition-all ${
                  isToday
                    ? "bg-[#FFF7F8] border-2 border-[#D88C9A]/60 shadow-[0_4px_16px_rgba(216,140,154,0.15)]"
                    : isYesterday
                    ? "bg-[#FFF7F8]/90 border border-[#EBC7CE]/70"
                    : "bg-[#FFF7F8]/80 border border-[#EBC7CE]/40"
                }`}
              >
                {/* Day Header & Percentage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D88C9A] text-white tracking-wide">
                        <Sparkles size={11} />
                        Today
                      </span>
                    ) : isYesterday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBC7CE]/60 text-[#242124] tracking-wide">
                        <Clock size={11} className="text-[#D88C9A]" />
                        Yesterday
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#242124]">
                        <Calendar size={13} className="text-[#D88C9A]" />
                        <span>{dateInfo.main}</span>
                      </div>
                    )}

                    {dateInfo.sub && (
                      <span className="text-[10px] sm:text-[11px] text-[#9B9499]">
                        • {dateInfo.sub}
                      </span>
                    )}
                  </div>

                  {/* Percentage number */}
                  <div className="flex items-baseline">
                    <span
                      className={`text-2xl sm:text-3xl font-serif ${
                        is100 ? "text-[#D88C9A] font-bold" : "text-[#242124]"
                      }`}
                    >
                      {formatPercentageValue(entry.percentage)}
                    </span>
                    <span className="text-sm text-[#D88C9A] ml-0.5">%</span>
                  </div>
                </div>

                {/* Sweet Note / Message if one was left for that day */}
                {entry.message && (
                  <div className="flex items-start gap-2 pt-2 border-t border-[#EBC7CE]/30">
                    <MessageSquareHeart
                      size={13}
                      className="text-[#D88C9A] mt-0.5 shrink-0"
                    />
                    <p className="text-xs sm:text-sm text-[#6E676C] italic leading-relaxed">
                      &ldquo;{entry.message}&rdquo;
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Return home footer link */}
      <div className="z-10 mt-auto pb-4">
        <Link
          href="/"
          className="text-xs text-[#7A7276] hover:text-[#242124] border-b border-transparent hover:border-[#D88C9A] transition-all touch-manipulation py-1"
        >
          Return to today
        </Link>
      </div>
    </main>
  );
}
