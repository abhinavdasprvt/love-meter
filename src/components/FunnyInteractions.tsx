"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Hand, MessageCircleHeart, Cookie } from "lucide-react";
import { Person } from "@/types";
import confetti from "canvas-confetti";

interface FunnyInteractionsProps {
  person: Person;
}

const ABHINAV_POKES = [
  "Abhinav blushed immediately 😳",
  "Abhinav got flustered and dropped his phone 😂",
  "Abhinav says: 'Hey that tickles! Now come cuddle 🫂'",
  "Abhinav's love meter spiked by +1000% 📈💙",
  "Abhinav sent back 5 forehead kisses 💋",
  "Abhinav is smiling like an absolute fool over here ✨",
];

const TRUPTI_POKES = [
  "Trupti made an adorable pout 😤💕",
  "Trupti demands 2 scoops of ice cream as compensation 🍦",
  "Trupti says: 'You are so annoying today 😂'",
  "Trupti sent back 10x aggressive cuddles 🧸",
  "Trupti is secretly smiling at her screen 🌸",
  "Trupti says: 'Missing you extra right now 🥺'",
];

const LOVE_FORTUNES = [
  "Today's prophecy: 100% chance of sudden cuddles and silly giggles 🌸",
  "The stars declare: You two are the sweetest couple in the multiverse ✨",
  "Warning: High danger of looking at each other's pictures and smiling all day 📸",
  "Love forecast: Extremely sunny with frequent showers of warm kisses 💋",
  "Romantic memo: Don't forget to order something tasty together soon 🍕",
];

export default function FunnyInteractions({ person }: FunnyInteractionsProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPoking, setIsPoking] = useState<boolean>(false);

  const isAbhinav = person === "abhinav";
  const partnerName = isAbhinav ? "Abhinav" : "Trupti";

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handlePoke = () => {
    setIsPoking(true);
    const pokes = isAbhinav ? ABHINAV_POKES : TRUPTI_POKES;
    const randomPoke = pokes[Math.floor(Math.random() * pokes.length)];
    triggerToast(randomPoke);

    setTimeout(() => setIsPoking(false), 300);
  };

  const handleKiss = () => {
    try {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.8 },
        colors: isAbhinav
          ? ["#4A88E8", "#C3DDF7", "#FFFFFF"]
          : ["#D88C9A", "#EBC7CE", "#FFFFFF"],
      });
    } catch {}

    triggerToast(`A sweet virtual kiss landed on ${partnerName}'s cheek! 💋✨`);
  };

  const handleFortune = () => {
    const fortune =
      LOVE_FORTUNES[Math.floor(Math.random() * LOVE_FORTUNES.length)];
    triggerToast(`🥠 Fortune: ${fortune}`);
  };

  const btnBg = isAbhinav
    ? "bg-[#EEF5FD] hover:bg-[#E0EEFC] border-[#C3DDF7] text-[#3B7CD8]"
    : "bg-[#FFF7F8] hover:bg-[#FFEBF0] border-[#EBC7CE] text-[#D88C9A]";

  return (
    <div className="z-10 w-full max-w-xs flex flex-col items-center gap-2 mt-1">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] sm:max-w-md bg-[#242124]/92 text-white text-xs px-4 py-2.5 rounded-full shadow-xl border border-white/10 text-center font-medium backdrop-blur-md"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Fun Interaction Pills */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        <button
          onClick={handlePoke}
          className={`flex-1 py-1.5 px-2.5 rounded-full border text-[11px] font-medium transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer touch-manipulation shadow-2xs ${btnBg} ${
            isPoking ? "scale-95" : ""
          }`}
          title={`Poke ${partnerName}`}
        >
          <Hand size={11} className={isPoking ? "rotate-12" : ""} />
          <span>Poke {partnerName} 👉</span>
        </button>

        <button
          onClick={handleKiss}
          className={`flex-1 py-1.5 px-2.5 rounded-full border text-[11px] font-medium transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer touch-manipulation shadow-2xs ${btnBg}`}
          title="Send a kiss"
        >
          <Heart size={11} className="fill-current" />
          <span>Send Kiss 💋</span>
        </button>

        <button
          onClick={handleFortune}
          className={`py-1.5 px-2.5 rounded-full border text-[11px] font-medium transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer touch-manipulation shadow-2xs ${btnBg}`}
          title="Daily Love Fortune"
        >
          <Cookie size={11} />
        </button>
      </div>
    </div>
  );
}
