"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Heart,
  TrendingUp,
  Award,
  Zap,
  Smile,
  Flame,
  Check,
} from "lucide-react";
import {
  LoveUpdate,
  calculateLoveComparison,
  formatPercentageValue,
  formatRelativeDate,
} from "@/types";
import confetti from "canvas-confetti";

interface LoveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  abhinavUpdate: LoveUpdate | null;
  truptiUpdate: LoveUpdate | null;
}

export default function LoveAnalysisModal({
  isOpen,
  onClose,
  abhinavUpdate,
  truptiUpdate,
}: LoveAnalysisModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  if (!isOpen) return null;

  const abhinavScore = abhinavUpdate ? abhinavUpdate.percentage : 95;
  const truptiScore = truptiUpdate ? truptiUpdate.percentage : 78;

  const comparison = calculateLoveComparison(abhinavScore, truptiScore);

  const handleRecalculate = () => {
    setIsSyncing(true);
    setSyncDone(false);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#D88C9A", "#4A88E8", "#EBC7CE", "#C3DDF7"],
      });
    } catch {}

    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2500);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#242124]/40 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#FFFDFD] via-[#FFF9FA] to-[#F5F9FD] border border-[#EBC7CE]/80 shadow-[0_25px_60px_rgba(0,0,0,0.15)] p-5 sm:p-7 z-10 flex flex-col my-auto max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EBC7CE]/40">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="text-lg sm:text-xl font-serif text-[#242124]">
                  Our Love Analysis
                </h3>
                <p className="text-[11px] text-[#7A7276]">
                  Abhinav 💙 & Trupti 🌸 Mutual Sync
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#7A7276] hover:text-[#242124] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sync Score Big Card */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white/80 border border-[#EBC7CE]/60 shadow-xs flex flex-col items-center text-center">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#7A7276] mb-1">
              Harmonic Resonance
            </span>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl sm:text-5xl font-serif text-[#242124] tracking-tight">
                {formatPercentageValue(comparison.syncScore)}%
              </span>
              <span className="text-sm font-medium text-[#D88C9A]">Sync</span>
            </div>

            {/* Harmony Badge */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FFF0F3] to-[#EEF5FD] border border-[#EBC7CE]/70 text-xs font-medium text-[#242124] shadow-2xs">
              <Sparkles size={12} className="text-[#D88C9A]" />
              <span>{comparison.harmonyLevel}</span>
            </div>

            {/* Funny Insight */}
            <p className="mt-3 text-xs text-[#6E676C] font-light leading-relaxed max-w-sm italic">
              &ldquo;{comparison.funnyInsight}&rdquo;
            </p>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Abhinav Card */}
            <div className="rounded-2xl bg-[#EEF5FD]/90 border border-[#C3DDF7] p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#3B7CD8] flex items-center gap-1">
                    <span>Abhinav</span>
                    <span>💙</span>
                  </span>
                  <span className="text-[10px] text-[#7A7276]">
                    {abhinavUpdate
                      ? formatRelativeDate(abhinavUpdate.created_at)
                      : "Today"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-serif text-[#242124]">
                    {formatPercentageValue(abhinavScore)}%
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7276] mt-0.5 line-clamp-1">
                  how much he loves her
                </p>
              </div>

              {abhinavUpdate?.message && (
                <div className="mt-2.5 pt-2 border-t border-[#C3DDF7]/60 text-[11px] text-[#242124] italic line-clamp-2">
                  &ldquo;{abhinavUpdate.message}&rdquo;
                </div>
              )}
            </div>

            {/* Trupti Card */}
            <div className="rounded-2xl bg-[#FFF7F8]/90 border border-[#EBC7CE] p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#D88C9A] flex items-center gap-1">
                    <span>Trupti</span>
                    <span>🌸</span>
                  </span>
                  <span className="text-[10px] text-[#7A7276]">
                    {truptiUpdate
                      ? formatRelativeDate(truptiUpdate.created_at)
                      : "Today"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-serif text-[#242124]">
                    {formatPercentageValue(truptiScore)}%
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7276] mt-0.5 line-clamp-1">
                  how much she loves him
                </p>
              </div>

              {truptiUpdate?.message && (
                <div className="mt-2.5 pt-2 border-t border-[#EBC7CE]/60 text-[11px] text-[#242124] italic line-clamp-2">
                  &ldquo;{truptiUpdate.message}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Funny Relationship Badges */}
          <div className="mt-4 p-3.5 rounded-2xl bg-white/70 border border-[#EBC7CE]/50 space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#7A7276] block">
              Cute Relationship Metrics
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FFF9FA] border border-[#EBC7CE]/30">
                <Flame size={13} className="text-[#D88C9A] shrink-0" />
                <div>
                  <p className="font-medium text-[#242124]">Cuddle Index</p>
                  <p className="text-[10px] text-[#7A7276]">100% Maximum</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F0F7FD] border border-[#C3DDF7]/40">
                <Smile size={13} className="text-[#3B7CD8] shrink-0" />
                <div>
                  <p className="font-medium text-[#242124]">Sweetness Level</p>
                  <p className="text-[10px] text-[#7A7276]">Off the charts 🍯</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F0F7FD] border border-[#C3DDF7]/40">
                <Zap size={13} className="text-[#3B7CD8] shrink-0" />
                <div>
                  <p className="font-medium text-[#242124]">Daily Telepathy</p>
                  <p className="text-[10px] text-[#7A7276]">Strong sync ⚡</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FFF9FA] border border-[#EBC7CE]/30">
                <Award size={13} className="text-[#D88C9A] shrink-0" />
                <div>
                  <p className="font-medium text-[#242124]">Best Couple</p>
                  <p className="text-[10px] text-[#7A7276]">Verified Forever 🏆</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-5 flex items-center justify-center">
            <button
              onClick={handleRecalculate}
              disabled={isSyncing}
              className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#D88C9A] via-[#B87A9E] to-[#4A88E8] hover:opacity-95 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              {syncDone ? (
                <>
                  <Check size={14} />
                  <span>Resonance Recalibrated Perfectly! ✨</span>
                </>
              ) : isSyncing ? (
                <span>Recalibrating Love Frequencies...</span>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Recalibrate Love Resonance ✨</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
