"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Sparkles, Plus, Minus } from "lucide-react";
import { fetchAllUpdates, getTodayUpdate, saveLoveUpdate } from "@/lib/storage";
import { isUserAuthenticated, AuthRole } from "@/lib/auth";
import { LoveUpdate, formatPercentageValue } from "@/types";
import AnimatedPercentage from "@/components/AnimatedPercentage";
import DynamicMessageDisplay from "@/components/DynamicMessage";
import PetalParticles from "@/components/PetalParticles";
import AuthModal from "@/components/AuthModal";
import confetti from "canvas-confetti";

const SWEET_NOTE_SUGGESTIONS = [
  "You're annoying today 😂",
  "Missing you extra today 🥺",
  "Craving ice cream with you 🍦",
  "Thank you for being sweet 💕",
  "Best boy ever ✨",
  "Can we cuddle soon? 🌸",
  "Thinking about your smile 💭",
];

export default function UpdatePage() {
  const router = useRouter();
  const [percentage, setPercentage] = useState<number>(78);
  const [message, setMessage] = useState<string>("");
  const [todayUpdate, setTodayUpdate] = useState<LoveUpdate | null>(null);
  const [isEditingToday, setIsEditingToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      setIsAuthModalOpen(true);
    }

    const checkExisting = async () => {
      try {
        const all = await fetchAllUpdates();
        const today = getTodayUpdate(all);
        if (today) {
          setTodayUpdate(today);
          setPercentage(today.percentage);
          if (today.message) setMessage(today.message);
        } else if (all.length > 0) {
          setPercentage(all[0].percentage);
        }
      } catch (e) {
        console.error("Error loading today's entry:", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkExisting();
  }, []);

  const adjustValue = (delta: number) => {
    setPercentage((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.min(100, Math.max(0, next));
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const clean = Math.round(val * 10) / 10;
    setPercentage(clean);

    if (clean === 100) {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#D88C9A", "#EBC7CE", "#F6E6EA"],
        disableForReducedMotion: true,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await saveLoveUpdate(percentage, message);
      if (res.success) {
        setSaveSuccess(true);
        if (percentage === 100) {
          confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.5 },
            colors: ["#D88C9A", "#EBC7CE", "#FFD700"],
          });
        }
        setTimeout(() => {
          router.push("/");
        }, 1600);
      } else {
        setErrorMessage(res.error || "Something went wrong. Try again 🪷");
        setIsSaving(false);
      }
    } catch {
      setErrorMessage("Couldn't save this one. Please try again.");
      setIsSaving(false);
    }
  };

  const hasAlreadyUpdatedToday = Boolean(todayUpdate) && !isEditingToday;

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10 selection:bg-[#EBC7CE] overflow-x-hidden">
      <PetalParticles isSpecial={percentage === 100} />

      {/* Top Header */}
      <div className="z-10 w-full max-w-sm flex items-center justify-between mb-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#7A7276] hover:text-[#242124] transition-colors py-2 px-1 group touch-manipulation"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back</span>
        </Link>
        <span className="text-xl select-none" role="img" aria-label="lotus">
          🪷
        </span>
        <div className="w-12" />
      </div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full max-w-sm my-auto flex flex-col items-center py-2"
      >
        {isLoading ? (
          <div className="py-20 text-sm text-[#7A7276] animate-pulse">
            Loading today&apos;s feeling...
          </div>
        ) : hasAlreadyUpdatedToday ? (
          /* State: Already updated today */
          <div className="w-full flex flex-col items-center text-center py-4 px-2">
            <div className="w-12 h-12 rounded-full bg-[#EBC7CE]/40 flex items-center justify-center text-[#D88C9A] mb-3">
              <Check size={22} strokeWidth={2.5} />
            </div>

            <h2 className="text-xs uppercase tracking-widest text-[#7A7276] font-medium">
              Today&apos;s percentage
            </h2>

            <div className="my-2">
              <AnimatedPercentage
                value={todayUpdate?.percentage ?? 82.5}
                className="text-6xl sm:text-7xl font-normal"
              />
            </div>

            {todayUpdate?.message && (
              <p className="text-sm italic text-[#7A7276] bg-[#FFF7F8] px-4 py-2.5 rounded-xl border border-[#EBC7CE]/40 mb-3 max-w-xs shadow-xs">
                &ldquo;{todayUpdate.message}&rdquo;
              </p>
            )}

            <p className="text-base text-[#242124] font-serif mt-1">
              You&apos;ve already updated today 🪷
            </p>
            <p className="text-xs text-[#7A7276] mt-1 mb-6">
              Come back tomorrow or adjust today&apos;s feeling below.
            </p>

            <button
              onClick={() => setIsEditingToday(true)}
              className="w-full py-3.5 px-6 rounded-full bg-white/90 hover:bg-white text-xs font-semibold tracking-wider text-[#242124] uppercase border border-[#EBC7CE] shadow-xs active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
            >
              Edit today&apos;s feeling
            </button>
          </div>
        ) : (
          /* State: Active Slider & Note Form */
          <div className="w-full flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-serif text-[#242124] text-center">
              How much today?
            </h2>
            <p className="text-xs text-[#7A7276] text-center mb-5">
              Slide or fine-tune to wherever your heart is right now
            </p>

            {/* Live Percentage Display */}
            <div className="mb-2">
              <AnimatedPercentage
                value={percentage}
                className="text-6xl sm:text-7xl font-normal"
              />
            </div>

            {/* Dynamic reaction preview */}
            <DynamicMessageDisplay percentage={percentage} className="mb-4" />

            {/* Interactive Tactile Slider */}
            <div className="w-full px-2 mb-3">
              <div className="relative flex items-center py-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percentage}
                  onChange={handleSliderChange}
                  aria-label="Love percentage slider"
                  className="w-full h-2 rounded-lg cursor-pointer touch-manipulation"
                />
              </div>

              {/* Slider scale numbers */}
              <div className="flex justify-between text-[11px] text-[#9B9499] font-medium px-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Decimal Fine-Tuning Controls */}
            <div className="flex items-center justify-center gap-2 mb-6 w-full">
              <button
                type="button"
                onClick={() => adjustValue(-1)}
                className="px-2.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-xs font-medium text-[#7A7276] border border-[#EBC7CE]/60 active:scale-95 transition-all shadow-xs touch-manipulation cursor-pointer"
              >
                -1%
              </button>
              <button
                type="button"
                onClick={() => adjustValue(-0.1)}
                className="px-2.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-xs font-medium text-[#7A7276] border border-[#EBC7CE]/60 active:scale-95 transition-all shadow-xs touch-manipulation cursor-pointer flex items-center gap-0.5"
              >
                <Minus size={11} />
                <span>0.1</span>
              </button>

              <span className="text-xs font-medium text-[#D88C9A] px-2 select-none">
                {formatPercentageValue(percentage)}%
              </span>

              <button
                type="button"
                onClick={() => adjustValue(0.1)}
                className="px-2.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-xs font-medium text-[#7A7276] border border-[#EBC7CE]/60 active:scale-95 transition-all shadow-xs touch-manipulation cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={11} />
                <span>0.1</span>
              </button>
              <button
                type="button"
                onClick={() => adjustValue(1)}
                className="px-2.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-xs font-medium text-[#7A7276] border border-[#EBC7CE]/60 active:scale-95 transition-all shadow-xs touch-manipulation cursor-pointer"
              >
                +1%
              </button>
            </div>

            {/* Sweet & Teasy Quick Notes Suggestions */}
            <div className="w-full mb-3">
              <p className="text-[11px] text-[#7A7276] mb-1.5 px-1 font-medium">
                Sweet little thoughts:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
                {SWEET_NOTE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setMessage(suggestion)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/80 hover:bg-white active:scale-95 text-[#6E676C] hover:text-[#242124] border border-[#EBC7CE]/50 transition-all touch-manipulation shadow-xs cursor-pointer text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Daily Note Textarea */}
            <div className="w-full flex flex-col gap-1 mb-6">
              <label
                htmlFor="daily-note"
                className="text-xs font-medium text-[#7A7276] flex items-center justify-between px-1"
              >
                <span>Want to leave a little note?</span>
                <span className="text-[10px] text-[#9B9499] font-normal">(optional)</span>
              </label>
              <textarea
                id="daily-note"
                rows={2}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Today was actually nice :)"
                className="w-full text-sm rounded-2xl bg-white/90 border border-[#EBC7CE]/70 p-3 text-[#242124] placeholder-[#9B9499]/70 focus:outline-none focus:border-[#D88C9A] focus:ring-1 focus:ring-[#D88C9A] transition-all resize-none shadow-xs"
              />
            </div>

            {/* Error state */}
            {errorMessage && (
              <p className="text-xs text-[#C97B89] mb-3 text-center">
                {errorMessage}
              </p>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className={`w-full py-3.5 px-6 rounded-full font-medium text-sm sm:text-base tracking-wide shadow-[0_4px_18px_rgba(216,140,154,0.35)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 touch-manipulation ${
                saveSuccess
                  ? "bg-[#8CB39A] text-white"
                  : "bg-[#D88C9A] hover:bg-[#C97B89] active:scale-[0.98] text-white"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check size={18} />
                  <span>Saved 🪷</span>
                </>
              ) : isSaving ? (
                <span>Saving feeling...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save today&apos;s feeling</span>
                </>
              )}
            </button>

            {/* Save confirmation preview */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-center"
                >
                  <p className="text-xs text-[#7A7276]">
                    Today&apos;s feeling:{" "}
                    <strong className="text-[#242124]">
                      {formatPercentageValue(percentage)}%
                    </strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Subtle bottom note */}
      <div className="z-10 text-[11px] text-[#9B9499] text-center pb-2">
        TRUPTI 🪷✨ • A private digital space
      </div>

      {/* PIN Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          router.push("/");
        }}
        onSuccess={(role: AuthRole) => {
          setIsAuthModalOpen(false);
          if (role === "admin") router.push("/admin");
        }}
      />
    </main>
  );
}
