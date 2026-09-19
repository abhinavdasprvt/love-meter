"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export default function ProgressRing({
  percentage,
  size = 260,
  strokeWidth = 3.5,
  children,
}: ProgressRingProps) {
  const center = size / 2;
  const radius = center - strokeWidth * 2.5;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;
  const isComplete = clamped === 100;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center drop-shadow-[0_4px_12px_rgba(216,140,154,0.08)]"
      >
        {/* Subtle background track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#EBC7CE"
          strokeWidth={strokeWidth}
          strokeOpacity="0.4"
        />

        {/* Animated Progress Ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={isComplete ? "#D88C9A" : "#D88C9A"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.4,
            ease: [0.25, 1, 0.5, 1], // Smooth cubic-bezier easeOut
          }}
          className={isComplete ? "filter drop-shadow-[0_0_8px_rgba(216,140,154,0.6)]" : ""}
        />

        {/* Delicate indicator dot at current head if percentage > 0 */}
        {clamped > 2 && clamped < 99 && (
          <motion.circle
            cx={center}
            cy={center}
            r={strokeWidth * 1.3}
            fill="#D88C9A"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              transformOrigin: `${center}px ${center}px`,
              transform: `rotate(${(clamped / 100) * 360}deg) translate(${radius}px, 0)`,
            }}
          />
        )}
      </svg>

      {/* Center content (e.g., the large percentage and lotus) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
