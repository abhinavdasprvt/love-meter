"use client";

import React, { useState } from "react";
import { LoveUpdate, Person, formatPercentageValue } from "@/types";
import { motion } from "framer-motion";

interface HistoryGraphProps {
  updates: LoveUpdate[];
  person?: Person;
  theme?: "pink" | "blue";
  className?: string;
}

// Baseline data points for Abhinav if fewer than 2 entries are present in database
const ABHINAV_DEFAULT_POINTS: LoveUpdate[] = [
  {
    id: "seed-a1",
    percentage: 91.0,
    message: "Falling in love with you more every second ✨",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    person: "abhinav",
  },
  {
    id: "seed-a2",
    percentage: 93.5,
    message: "Thinking of your sweet smile today 💙",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    person: "abhinav",
  },
  {
    id: "seed-a3",
    percentage: 94.0,
    message: "Can never stop missing you my girl 🥺💙",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    person: "abhinav",
  },
  {
    id: "seed-a4",
    percentage: 95.5,
    message: "You make my whole world so beautiful 🪐",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    person: "abhinav",
  },
  {
    id: "seed-a5",
    percentage: 96.5,
    message: "You're my entire galaxy 💙",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    person: "abhinav",
  },
];

export default function HistoryGraph({
  updates,
  person,
  theme,
  className = "",
}: HistoryGraphProps) {
  const [activePoint, setActivePoint] = useState<{
    x: number;
    y: number;
    percentage: number;
    date: string;
    message?: string | null;
  } | null>(null);

  const activeTheme = theme || (person === "abhinav" ? "blue" : "pink");
  const isAbhinav = activeTheme === "blue";

  // If updates array has fewer than 2 entries, provide fallback points so graph always renders
  let displayUpdates = updates;
  if (!displayUpdates || displayUpdates.length < 2) {
    if (isAbhinav) {
      if (displayUpdates && displayUpdates.length === 1) {
        displayUpdates = [...ABHINAV_DEFAULT_POINTS.slice(0, 4), displayUpdates[0]];
      } else {
        displayUpdates = ABHINAV_DEFAULT_POINTS;
      }
    }
  }

  if (!displayUpdates || displayUpdates.length < 2) {
    return null;
  }

  // Take most recent 7 entries and reverse to chronological order (left to right)
  const chronological = [...displayUpdates.slice(0, 7)].reverse();

  const width = 340;
  const height = 140;
  const paddingX = 26;
  const paddingY = 22;

  // Find min and max for smart auto-scaling so curves look elegant
  const values = chronological.map((u) => u.percentage);
  const minObserved = Math.min(...values);
  const maxObserved = Math.max(...values);
  const minVal = Math.max(0, Math.floor((minObserved - 12) / 5) * 5);
  const maxVal = Math.min(100, Math.ceil((maxObserved + 8) / 5) * 5);

  const points = chronological.map((u, i) => {
    const x =
      paddingX + (i / (chronological.length - 1)) * (width - paddingX * 2);
    const range = maxVal - minVal || 1;
    const y =
      height - paddingY - ((u.percentage - minVal) / range) * (height - paddingY * 2);
    return {
      x,
      y,
      percentage: u.percentage,
      message: u.message,
      date: new Date(u.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      rawDate: u.created_at,
    };
  });

  // Construct smooth bezier curve path
  const createPath = () => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createPath();
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - paddingY
  } L ${points[0].x} ${height - paddingY} Z`;

  const latestVal = chronological[chronological.length - 1].percentage;

  // Theming
  const strokeColor = isAbhinav ? "#4A88E8" : "#D88C9A";
  const baselineColor = isAbhinav ? "#C3DDF7" : "#EBC7CE";
  const cardBg = isAbhinav ? "bg-[#EEF5FD]/90" : "bg-[#FFF7F8]/90";
  const cardBorder = isAbhinav ? "border-[#C3DDF7]/80" : "border-[#EBC7CE]/60";
  const textColor = isAbhinav ? "text-[#3B7CD8]" : "text-[#D88C9A]";
  const gradientId = isAbhinav ? "blueGraphGradient" : "roseGraphGradient";

  return (
    <div
      className={`w-full max-w-sm sm:max-w-md mx-auto rounded-3xl ${cardBg} border ${cardBorder} p-4 sm:p-5 shadow-xs backdrop-blur-xs transition-colors duration-500 ${className}`}
    >
      {/* Header matching user's design */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-[#7A7276]">
          Love lately
        </h3>
        <span className={`text-xs sm:text-sm font-medium ${textColor}`}>
          {formatPercentageValue(latestVal)}% today
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Dotted horizontal baseline */}
          <line
            x1={paddingX - 10}
            y1={height - paddingY}
            x2={width - paddingX + 10}
            y2={height - paddingY}
            stroke={baselineColor}
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.7"
          />

          {/* Area Fill */}
          <motion.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Spline Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#FFFFFF"
                stroke={strokeColor}
                strokeWidth="2.5"
                className="transition-transform hover:scale-130"
                onMouseEnter={() => setActivePoint(p)}
                onClick={() => setActivePoint(p)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill="transparent"
                onMouseEnter={() => setActivePoint(p)}
                onClick={() => setActivePoint(p)}
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#242124] text-white text-[10px] font-medium py-1 px-3 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none z-20 whitespace-nowrap"
          >
            <span>{activePoint.date}:</span>
            <span
              className={isAbhinav ? "text-[#C3DDF7] font-bold" : "text-[#EBC7CE] font-bold"}
            >
              {formatPercentageValue(activePoint.percentage)}%
            </span>
            {activePoint.message && (
              <span className="opacity-80 truncate max-w-[120px]">
                • &ldquo;{activePoint.message}&rdquo;
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Date ticks along bottom */}
      <div className="flex justify-between px-2 mt-2 text-[10px] sm:text-[11px] text-[#7A7276] font-medium">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
