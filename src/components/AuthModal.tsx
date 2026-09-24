"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { checkPin, setAuthenticatedSession, AuthRole, Person } from "@/lib/auth";
import { X, Delete, Shield, Heart } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: AuthRole) => void;
  targetPerson?: Person | "admin";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  targetPerson,
}: AuthModalProps) {
  const [pin, setPin] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const resetState = useCallback(() => {
    setPin("");
    setHasError(false);
    setErrorMessage("");
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const verifyAndSubmit = useCallback(
    (pinToVerify: string) => {
      const role = checkPin(pinToVerify);

      if (role) {
        setAuthenticatedSession(role);
        resetState();
        onSuccess(role);
      } else {
        setHasError(true);
        setErrorMessage("That secret doesn't seem right. ♡");
        setTimeout(() => {
          setPin("");
          setHasError(false);
        }, 800);
      }
    },
    [onSuccess, resetState]
  );

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);
        setHasError(false);
        setErrorMessage("");

        if (nextPin.length === 4) {
          setTimeout(() => {
            verifyAndSubmit(nextPin);
          }, 150);
        }
      }
    },
    [pin, verifyAndSubmit]
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
    setErrorMessage("");
  }, []);

  // Keyboard support for desktop
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyPress, handleDelete, handleClose]);

  if (!isOpen) return null;

  const isAbhinav = targetPerson === "abhinav";
  const isAdmin = targetPerson === "admin";

  const accentColor = isAbhinav
    ? "#4A88E8"
    : isAdmin
    ? "#7A7276"
    : "#D88C9A";
  const borderColor = isAbhinav
    ? "#C3DDF7"
    : isAdmin
    ? "#D1D5DB"
    : "#EBC7CE";
  const bgCard = isAbhinav
    ? "bg-[#F0F6FA]"
    : isAdmin
    ? "bg-white"
    : "bg-[#FFF7F8]";

  const titleText = isAbhinav
    ? "Enter Abhinav's Passcode 💙"
    : isAdmin
    ? "Admin Passcode (0609) 🔒"
    : "Enter Trupti's Passcode 🌸";

  const subtitleText = isAbhinav
    ? "Abhinav's secret 4-digit code (2305) ♡"
    : isAdmin
    ? "Secret admin dashboard pass ♡"
    : "A special 4-digit code (1603) ♡";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleClose}
          className="fixed inset-0 bg-[#242124]/35 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-xs sm:max-w-sm rounded-3xl ${bgCard} p-7 shadow-2xl border ${borderColor} z-10 flex flex-col items-center`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full text-[#7A7276] hover:text-[#242124] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Icon */}
          <div className="text-3xl mb-1.5 select-none animate-gentle-float">
            {isAbhinav ? "🪐" : isAdmin ? "🛡️" : "🪷"}
          </div>

          {/* Heading */}
          <h3 className="text-lg font-serif text-[#242124] text-center">
            {titleText}
          </h3>
          <p className="text-[11px] text-[#7A7276] mt-1 text-center leading-relaxed">
            {subtitleText}
          </p>

          {/* PIN Dots Display with Shake Animation */}
          <motion.div
            animate={hasError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-4 my-6 py-2"
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              return (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    scale: isFilled ? 1.15 : 1,
                    backgroundColor: isFilled ? accentColor : "transparent",
                    borderColor: isFilled ? accentColor : borderColor,
                  }}
                  transition={{ duration: 0.15 }}
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                />
              );
            })}
          </motion.div>

          {/* Error message */}
          <div className="h-5 mb-2 text-center">
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#C97B89] font-medium"
              >
                {errorMessage}
              </motion.p>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="w-14 h-14 mx-auto rounded-full bg-white/80 hover:bg-white active:scale-95 text-lg font-medium text-[#242124] shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-black/5 transition-all flex items-center justify-center focus:outline-none touch-manipulation cursor-pointer"
              >
                {num}
              </button>
            ))}
            <div className="w-14 h-14" />
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="w-14 h-14 mx-auto rounded-full bg-white/80 hover:bg-white active:scale-95 text-lg font-medium text-[#242124] shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-black/5 transition-all flex items-center justify-center focus:outline-none touch-manipulation cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete"
              className="w-14 h-14 mx-auto rounded-full bg-transparent hover:bg-black/5 active:scale-95 text-[#7A7276] hover:text-[#242124] transition-all flex items-center justify-center focus:outline-none touch-manipulation cursor-pointer"
            >
              <Delete size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
