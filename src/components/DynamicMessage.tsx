"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDynamicMessage, Person } from "@/types";

interface DynamicMessageProps {
  percentage: number;
  person?: Person;
  className?: string;
}

export default function DynamicMessageDisplay({
  percentage,
  person = "trupti",
  className = "",
}: DynamicMessageProps) {
  const message = getDynamicMessage(percentage, person);
  const isHundred = percentage === 100;
  const isZero = percentage === 0;

  const accentColor = person === "abhinav" ? "text-[#4A88E8]" : "text-[#D88C9A]";

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[3.2rem] px-4 ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${person}-${percentage}-${message.text}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center"
        >
          <p
            className={`text-base sm:text-lg font-medium tracking-tight ${
              isHundred
                ? `${accentColor} font-serif italic text-lg sm:text-xl`
                : isZero
                ? "text-[#7A7276] italic"
                : "text-[#242124]"
            }`}
          >
            {isHundred
              ? person === "abhinav"
                ? "completely yours forever. 🪐💙"
                : "completely yours. 🪷"
              : message.text}
          </p>
          {message.subtext && !isHundred && (
            <p className="text-xs sm:text-sm text-[#7A7276] mt-0.5 tracking-normal">
              {message.subtext}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
