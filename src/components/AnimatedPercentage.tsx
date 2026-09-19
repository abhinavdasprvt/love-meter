"use client";

import React, { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface AnimatedPercentageProps {
  value: number;
  duration?: number;
  className?: string;
  showPercentSign?: boolean;
}

export default function AnimatedPercentage({
  value,
  duration = 1.0,
  className = "",
  showPercentSign = true,
}: AnimatedPercentageProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1], // easeOutQuint
      onUpdate: (latest) => {
        // Round to 1 decimal place during animation
        setDisplayValue(Math.round(latest * 10) / 10);
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  // Determine if there is an active decimal component
  const hasDecimal = displayValue % 1 !== 0;
  const intPart = Math.floor(displayValue);
  const decimalPart = hasDecimal ? (displayValue % 1).toFixed(1).substring(1) : "";

  return (
    <span
      className={`inline-flex items-baseline font-serif tracking-tight text-[#242124] ${className}`}
      style={{ fontFeatureSettings: '"tnum"' }}
      aria-label={`${displayValue} percent`}
    >
      <span>{intPart}</span>
      {hasDecimal && (
        <span className="text-[0.62em] font-normal text-[#242124]/90 -ml-0.5">
          {decimalPart}
        </span>
      )}
      {showPercentSign && (
        <span className="text-[0.48em] font-normal text-[#D88C9A] ml-1 select-none">
          %
        </span>
      )}
    </span>
  );
}
