"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Sparkles, Plus, Minus } from "lucide-react";
import {
  fetchAllUpdates,
  getTodayUpdate,
  saveLoveUpdate,
} from "@/lib/storage";
import {
  isUserAuthenticated,
  getAuthenticatedRole,
  AuthRole,
} from "@/lib/auth";
import { LoveUpdate, Person, formatPercentageValue } from "@/types";
import AnimatedPercentage from "@/components/AnimatedPercentage";
import DynamicMessageDisplay from "@/components/DynamicMessage";
import PetalParticles from "@/components/PetalParticles";
import AuthModal from "@/components/AuthModal";
import confetti from "canvas-confetti";

const TRUPTI_NOTE_SUGGESTIONS = [
  "You're annoying today 😂",
  "Missing you extra today 🥺",
  "Craving ice cream with you 🍦",
  "Thank you for being sweet 💕",
  "Best boy ever ✨",
  "Can we cuddle soon? 🌸",
  "Thinking about your smile 💭",
];

const ABHINAV_NOTE_SUGGESTIONS = [
  "You're the prettiest girl in the world 🥺💙",
  "Can't wait to see your smile today ✨",
  "Ordering your favorite treats 🍦",
  "Head over heels for you 💕",
  "Thinking about holding your hand 🪐",
  "Best girlfriend ever 🌸",
  "Proud of you always 💫",
];

function UpdatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine person from query param or session
  const paramPerson = searchParams.get("person") as Person | null;
  const authRole = getAuthenticatedRole();
  const initialPerson: Person =
    paramPerson === "abhinav" || authRole === "abhinav"
      ? "abhinav"
      : "trupti";

  const [person, setPerson] = useState<Person>(initialPerson);
  const [percentage, setPercentage] = useState<number>(
    initialPerson === "abhinav" ? 95 : 78
  );
  const [message, setMessage] = useState<string>("");
  const [todayUpdate, setTodayUpdate] = useState<LoveUpdate | null>(null);
  const [isEditingToday, setIsEditingToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const isAbhinav = person === "abhinav";

  // Sync person from URL query parameter if present
  useEffect(() => {
    const p = searchParams.get("person") as Person | null;
    if (p && (p === "abhinav" || p === "trupti" || p === "both")) {
      setPerson(p);
    }
  }, [searchParams]);

  useEffect(() => {
    const role = getAuthenticatedRole();
    if (!role || (role !== "admin" && role !== person)) {
      setIsAuthModalOpen(true);
    }

    const checkExisting = async () => {
      try {
        const all = await fetchAllUpdates(person);
        const today = getTodayUpdate(all, person);
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
  }, [person]);

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
        colors: isAbhinav
          ? ["#4A88E8", "#C3DDF7", "#FFFFFF"]
          : ["#D88C9A", "#EBC7CE", "#F6E6EA"],
        disableForReducedMotion: true,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await saveLoveUpdate(percentage, message, person);
      if (res.success) {
        setSaveSuccess(true);
        if (percentage === 100) {
          confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.5 },
            colors: isAbhinav
              ? ["#4A88E8", "#C3DDF7", "#FFD700"]
              : ["#D88C9A", "#EBC7CE", "#FFD700"],
          });
        }
        setTimeout(() => {
          router.push("/");
        }, 1600);
      } else {
        setErrorMessage(res.error || "Something went wrong. Try again ♡");
        setIsSaving(false);
      }
    } catch {
      setErrorMessage("Couldn't save this one. Please try again.");
      setIsSaving(false);
    }
  };

  const hasAlreadyUpdatedToday = Boolean(todayUpdate) && !isEditingToday;
  const noteSuggestions = isAbhinav
    ? ABHINAV_NOTE_SUGGESTIONS
    : TRUPTI_NOTE_SUGGESTIONS;

  const bgTheme = isAbhinav ? "bg-[#F0F6FA]" : "bg-[#F7F3F0]";
  const selectionTheme = isAbhinav
    ? "selection:bg-[#C3DDF7]"
    : "selection:bg-[#EBC7CE]";
  const accentColor = isAbhinav ? "text-[#3B7CD8]" : "text-[#D88C9A]";
  const btnColor = isAbhinav
    ? "bg-[#4A88E8] hover:bg-[#3B7CD8] shadow-[0_4px_18px_rgba(74,136,232,0.35)]"
    : "bg-[#D88C9A] hover:bg-[#C97B89] shadow-[0_4px_18px_rgba(216,140,154,0.35)]";

  return (
    <main
      className={`relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10 ${bgTheme} ${selectionTheme} transition-colors duration-500 overflow-x-hidden`}
    >
      <PetalParticles person={person} />

      {/* Top Header */}
      <div className="z-10 w-full max-w-sm flex items-center justify-between">
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

        {/* Profile Switcher inside update */}
        <div className="flex items-center p-0.5 rounded-full bg-white/80 border border-black/5 shadow-2xs">
          <button
            onClick={() => setPerson("abhinav")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              isAbhinav
                ? "bg-[#E8F2FC] text-[#3B7CD8]"
                : "text-[#7A7276] hover:text-[#242124]"
            }`}
          >
            Abhinav 💙
          </button>
          <button
            onClick={() => setPerson("trupti")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              !isAbhinav
                ? "bg-[#FFF0F3] text-[#D88C9A]"
                : "text-[#7A7276] hover:text-[#242124]"
            }`}
          >
            Trupti 🌸
          </button>
        </div>

        <span className="text-xl select-none">{isAbhinav ? "🪐" : "🪷"}</span>
      </div>

      {/* Main Interactive Form Card */}
      <motion.div
        key={person}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-sm flex flex-col items-center my-auto py-2"
      >
        <span className="text-xs uppercase tracking-[0.25em] text-[#7A7276] font-semibold mb-1">
          {isAbhinav ? "Abhinav's Love Meter" : "Trupti's Love Meter"}
        </span>

        {/* Already entered today banner */}
        {hasAlreadyUpdatedToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 rounded-2xl bg-white/80 border border-black/5 text-center shadow-xs w-full"
          >
            <p className="text-xs text-[#7A7276] font-light">
              You already logged today&apos;s feeling!
            </p>
            <button
              onClick={() => setIsEditingToday(true)}
              className={`mt-1.5 text-xs font-semibold ${accentColor} underline cursor-pointer`}
            >
              Update it anyway?
            </button>
          </motion.div>
        )}

        {/* Big Percentage Display */}
        <div className="flex items-center justify-center my-2 select-none">
          <AnimatedPercentage
            value={isLoading ? 0 : percentage}
            className="text-7xl sm:text-8xl font-normal"
          />
        </div>

        {/* Dynamic Reaction Message */}
        <DynamicMessageDisplay
          percentage={percentage}
          person={person}
          className="mb-3"
        />

        {/* Slider & Precision Step Controls */}
        <div className="w-full flex flex-col gap-2.5 px-2">
          {/* Slider */}
          <div className="relative py-2">
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={percentage}
              disabled={isLoading || isSaving}
              onChange={handleSliderChange}
              aria-label="Love percentage"
              className="touch-none"
            />
          </div>

          {/* Stepper Buttons for Decimals */}
          <div className="flex items-center justify-between text-xs text-[#7A7276] px-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustValue(-1)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white active:scale-90 border border-black/5 flex items-center justify-center cursor-pointer shadow-2xs"
                title="-1%"
              >
                <Minus size={13} />
              </button>
              <button
                type="button"
                onClick={() => adjustValue(-0.1)}
                className="px-2 py-1 rounded-full bg-white/80 hover:bg-white active:scale-90 border border-black/5 text-[10px] cursor-pointer shadow-2xs font-mono"
              >
                -0.1
              </button>
            </div>

            <span className="text-[11px] font-mono text-[#9B9499]">
              {formatPercentageValue(percentage)}%
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustValue(+0.1)}
                className="px-2 py-1 rounded-full bg-white/80 hover:bg-white active:scale-90 border border-black/5 text-[10px] cursor-pointer shadow-2xs font-mono"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => adjustValue(+1)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white active:scale-90 border border-black/5 flex items-center justify-center cursor-pointer shadow-2xs"
                title="+1%"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Note Input */}
        <div className="w-full mt-4 flex flex-col gap-1.5">
          <label
            htmlFor="sweet-note"
            className="text-[11px] font-medium text-[#7A7276] px-1"
          >
            Leave a little note (optional) ♡
          </label>
          <div className="relative">
            <input
              id="sweet-note"
              type="text"
              maxLength={120}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isAbhinav
                  ? "A sweet message for Trupti..."
                  : "Say whatever you're feeling..."
              }
              className="w-full py-2.5 px-4 rounded-2xl bg-white/80 border border-black/5 text-sm text-[#242124] placeholder:text-[#9B9499] focus:outline-none focus:bg-white focus:border-[#D88C9A] transition-all shadow-2xs"
            />
          </div>

          {/* Quick Note Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {noteSuggestions.slice(0, 4).map((sugg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMessage(sugg)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/60 hover:bg-white border border-black/5 text-[10px] text-[#7A7276] hover:text-[#242124] transition-all cursor-pointer shadow-2xs"
              >
                {sugg}
              </button>
            ))}
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <p className="mt-2 text-xs text-red-500 text-center font-medium">
            {errorMessage}
          </p>
        )}
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="z-10 w-full max-w-sm pb-2"
      >
        <button
          onClick={handleSave}
          disabled={isSaving || saveSuccess}
          className={`w-full py-3.5 px-6 rounded-full ${btnColor} active:scale-[0.98] text-white font-medium text-sm sm:text-base tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group touch-manipulation disabled:opacity-80`}
        >
          {saveSuccess ? (
            <>
              <Check size={18} />
              <span>Saved with love ♡</span>
            </>
          ) : isSaving ? (
            <span>Saving your feeling...</span>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Save {isAbhinav ? "Abhinav's" : "today's"} percentage</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Gatekeeper PIN modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          router.push("/");
        }}
        onSuccess={(role: AuthRole) => {
          setIsAuthModalOpen(false);
          if (role === "abhinav") setPerson("abhinav");
          else if (role === "trupti") setPerson("trupti");
        }}
        targetPerson={person}
      />
    </main>
  );
}

export default function UpdatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-[#7A7276] animate-pulse">
          Loading...
        </div>
      }
    >
      <UpdatePageContent />
    </Suspense>
  );
}
