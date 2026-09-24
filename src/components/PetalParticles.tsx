"use client";

import React, { useEffect, useRef } from "react";
import { Person } from "@/types";

interface PetalParticlesProps {
  isSpecial?: boolean;
  theme?: "pink" | "blue";
  person?: Person;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  type: "petal" | "sparkle" | "heart";
}

const PINK_COLORS = [
  "rgba(216, 140, 154, 0.35)", // Soft rose
  "rgba(235, 199, 206, 0.45)", // Light blush
  "rgba(247, 219, 224, 0.3)",  // Whisper pink
  "rgba(255, 240, 243, 0.5)",  // Delicate blossom
];

const BLUE_COLORS = [
  "rgba(74, 136, 232, 0.32)",  // Celestial sky blue
  "rgba(147, 197, 253, 0.42)", // Soft powder blue
  "rgba(195, 221, 247, 0.45)", // Whisper baby blue
  "rgba(224, 242, 254, 0.55)", // Crystalline ice shimmer
];

export default function PetalParticles({
  isSpecial = false,
  theme,
  person,
}: PetalParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTheme = theme || (person === "abhinav" ? "blue" : "pink");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = activeTheme === "blue" ? BLUE_COLORS : PINK_COLORS;
    const count = isSpecial ? 30 : 14;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const randType = Math.random();
      const type: "petal" | "sparkle" | "heart" =
        randType > 0.6 ? "heart" : randType > 0.3 ? "petal" : "sparkle";

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 4,
        speedX: Math.random() * 0.6 - 0.25,
        speedY: Math.random() * 0.45 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        opacity: Math.random() * 0.35 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        type,
      });
    }

    const drawParticle = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.type === "petal") {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size / 2, -p.size, p.size, -p.size / 2, 0, p.size);
        ctx.bezierCurveTo(-p.size, -p.size / 2, -p.size / 2, -p.size, 0, 0);
        ctx.fill();
      } else if (p.type === "heart") {
        const s = p.size * 0.4;
        ctx.beginPath();
        ctx.moveTo(0, s);
        ctx.bezierCurveTo(-s * 2, -s, -s, -s * 2, 0, -s * 0.8);
        ctx.bezierCurveTo(s, -s * 2, s * 2, -s, 0, s);
        ctx.fill();
      } else {
        // Delicate shimmer dot
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -10;
        } else if (p.x < -20) {
          p.x = width + 10;
        }

        drawParticle(p);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpecial, activeTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-80 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
