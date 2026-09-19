"use client";

import React, { useState } from "react";
import { LoveUpdate, formatPercentageValue } from "@/types";
import { motion } from "framer-motion";

interface HistoryGraphProps {
  updates: LoveUpdate[];
}

export default function HistoryGraph({ updates }: HistoryGraphProps) {
  const [activePoint, setActivePoint] = useState<{
    x: number;
    y: number;
    percentage: number;
    date: string;
  } | null>(null);

  if (!updates || updates.length < 2) {
    return null;
  }

  // Take the most recent 7-10 entries and reverse to chronological order (left to right)
  const chronological = [...updates.slice(0, 8)].reverse();

  const width = 340;
  const height = 140;
  const paddingX = 28;
  const paddingY = 24;

  const minVal = 0;
  const maxVal = 100;

  const points = chronological.map((u, i) => {
    const x = paddingX + (i / (chronological.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((u.percentage - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return {
      x,
      y,
      percentage: u.percentage,
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

  return (
    <div className="w-full max-w-sm mx-auto my-5 rounded-2xl bg-[#FFF7F8]/85 border border-[#EBC7CE]/40 p-4 shadow-xs backdrop-blur-xs">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs tracking-wider uppercase font-medium text-[#7A7276]">
          Love lately
        </h3>
        <span className="text-[11px] text-[#D88C9A] font-medium">
          {formatPercentageValue(latestVal)}% today
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D88C9A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D88C9A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Faint horizontal baseline */}
          <line
            x1={paddingX - 10}
            y1={height - paddingY}
            x2={width - paddingX + 10}
            y2={height - paddingY}
            stroke="#EBC7CE"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />

          {/* Area Fill */}
          <motion.path
            d={areaPath}
            fill="url(#roseGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
          />

          {/* Spline Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#D88C9A"
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
                stroke="#D88C9A"
                strokeWidth="2.5"
                className="transition-transform hover:scale-125"
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
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-[#242124] text-white text-[10px] font-medium py-1 px-2.5 rounded-full shadow-md flex items-center gap-1.5 pointer-events-none"
          >
            <span>{activePoint.date}:</span>
            <span className="text-[#EBC7CE] font-bold">
              {formatPercentageValue(activePoint.percentage)}%
            </span>
          </motion.div>
        )}
      </div>

      {/* Date ticks along bottom */}
      <div className="flex justify-between px-2 mt-1 text-[10px] text-[#7A7276]">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
