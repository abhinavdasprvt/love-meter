export type Person = "abhinav" | "trupti" | "both";

export interface LoveUpdate {
  id: string;
  percentage: number;
  message?: string | null;
  created_at: string;
  updated_at: string;
  updated_by?: string | null;
  person?: Person;
}

export interface DynamicMessage {
  text: string;
  subtext?: string;
}

export function getDynamicMessage(
  percentage: number,
  person: Person = "trupti"
): DynamicMessage {
  const rounded = Math.round(percentage * 10) / 10;

  if (person === "both") {
    if (rounded >= 95) {
      return {
        text: "Cosmic Harmony! Perfectly in love 💕✨",
        subtext: "Both of your hearts are beating in complete sync.",
      };
    }
    if (rounded >= 80) {
      return {
        text: "Sweet Harmony! Truly meant to be 🌸🪐",
        subtext: "A match made in heaven, loving each other more each day.",
      };
    }
    return {
      text: "Growing closer with every heartbeat 💖",
      subtext: "Two souls writing the prettiest love story together.",
    };
  }

  if (person === "abhinav") {
    if (rounded === 0) {
      return {
        text: "Error 404: Impossible value detected! 🛸",
        subtext: "Abhinav's love meter physically cannot reach 0.",
      };
    }
    if (rounded <= 25) {
      return {
        text: "Even grumpy, you're the prettiest girl ever. 🥺💙",
        subtext: "Ordering your favorite treats and planning cuddles.",
      };
    }
    if (rounded <= 50) {
      return {
        text: "Halfway? You already own 100% of my thoughts! 🌊",
        subtext: "Just waiting for you to smile at me.",
      };
    }
    if (rounded <= 70) {
      return {
        text: "Madly in love with you today and always. ✨",
        subtext: "You make every single day feel so special.",
      };
    }
    if (rounded <= 85) {
      return {
        text: "Head over heels for my favorite girl. 💙",
        subtext: "My heart races every time your name pops up.",
      };
    }
    if (rounded <= 94) {
      return {
        text: "Completely obsessed with your smile. 🪐✨",
        subtext: "I fall in love with you all over again every morning.",
      };
    }
    if (rounded < 100) {
      return {
        text: `At ${rounded}%! Overflowing with love for you 💫`,
        subtext: "One little hug and I'm skyrocketing straight past 100%!",
      };
    }
    return {
      text: "100% and completely yours forever. 🪐💙",
      subtext: "My whole universe belongs to you, Trupti.",
    };
  }

  // Trupti's dynamic reactions
  if (rounded === 0) {
    return {
      text: "Well... that's honest. 😭",
      subtext: "Should I pack my bags or order you food?",
    };
  }
  if (rounded <= 15) {
    return {
      text: "Umm... we need to talk 😭",
      subtext: "Did I forget to text back or say something silly?",
    };
  }
  if (rounded <= 25) {
    return {
      text: "Emergency mode activated 🚨",
      subtext: "Bringing out emergency chocolates and warm hugs.",
    };
  }
  if (rounded <= 38) {
    return {
      text: "I'll take that as a maybe.",
      subtext: "Working overtime today to earn those points back! 🏃💨",
    };
  }
  if (rounded <= 50) {
    return {
      text: "Okay... we're getting somewhere.",
      subtext: "Halfway into your heart, holding on tight. 🌸",
    };
  }
  if (rounded <= 62) {
    return {
      text: "More than half! I'll take the win. 😏",
      subtext: "Feeling pretty lucky right now.",
    };
  }
  if (rounded <= 75) {
    return {
      text: "That's actually pretty cute.",
      subtext: "Making me smile like a fool over here. ✨",
    };
  }
  if (rounded <= 85) {
    return {
      text: "Someone's feeling a little extra sweet today. 🫶",
      subtext: "My heart definitely skipped a beat.",
    };
  }
  if (rounded <= 92) {
    return {
      text: "Warning: High affection levels detected! 💓",
      subtext: "You're making it impossible to stop thinking about you.",
    };
  }
  if (rounded <= 98) {
    return {
      text: "Okay, I'm blushing now.",
      subtext: "Are you trying to make me fall in love all over again?",
    };
  }
  if (rounded < 100) {
    return {
      text: `Almost 100%! Only ${(100 - rounded).toFixed(1)}% to go 🥺✨`,
      subtext: "What little secret must I do for that final bit?",
    };
  }
  return {
    text: "You reached the whole 100%. 🪷",
    subtext: "completely yours, today and forever.",
  };
}

export function formatPercentageValue(val: number): string {
  const num = Number(val);
  if (isNaN(num)) return "0";
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
}

export function formatRelativeDate(dateString: string): string {
  try {
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return "Recently";

    const now = new Date();
    const targetDate = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const diffMs = todayDate.getTime() - targetDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Updated today ✨";
    } else if (diffDays === 1) {
      return "Updated yesterday";
    } else if (diffDays > 1 && diffDays < 7) {
      return `Updated ${diffDays} days ago`;
    } else {
      return target.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  } catch {
    return "Recently";
  }
}

export function formatHistoryDate(dateString: string): {
  main: string;
  sub: string;
} {
  try {
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return { main: "Previous day", sub: "" };

    const now = new Date();
    const targetDate = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const diffDays = Math.round(
      (todayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const timeStr = target.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays === 0) {
      return { main: "Today", sub: timeStr };
    } else if (diffDays === 1) {
      return { main: "Yesterday", sub: timeStr };
    } else {
      const dateStr = target.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      return { main: dateStr, sub: timeStr };
    }
  } catch {
    return { main: "Past entry", sub: "" };
  }
}

export interface LoveComparison {
  abhinavScore: number;
  truptiScore: number;
  syncScore: number;
  difference: number;
  leader: "abhinav" | "trupti" | "tied";
  harmonyLevel: string;
  funnyInsight: string;
}

export function calculateLoveComparison(
  abhinavScore: number,
  truptiScore: number
): LoveComparison {
  const diff = Math.round(Math.abs(abhinavScore - truptiScore) * 10) / 10;
  const average = (abhinavScore + truptiScore) / 2;
  const closeness = Math.max(0, 100 - diff);
  // Balanced harmonic resonance: blends overall high love and mutual closeness
  const syncScore = Math.max(
    0,
    Math.min(100, Math.round((average * 0.6 + closeness * 0.4) * 10) / 10)
  );

  let leader: "abhinav" | "trupti" | "tied" = "tied";
  if (abhinavScore > truptiScore) leader = "abhinav";
  else if (truptiScore > abhinavScore) leader = "trupti";

  let harmonyLevel = "Harmonious Orbit ✨";
  if (syncScore >= 92) harmonyLevel = "Twin Souls Resonance 💫";
  else if (syncScore >= 80) harmonyLevel = "Super Sweet Alignment 🌸";
  else if (syncScore >= 65) harmonyLevel = "Playful Flirty Dynamic 😏";
  else harmonyLevel = "Cuddle Emergency 🚨 Hugs Required!";

  let funnyInsight = "Both of you are completely adorable together today.";
  if (leader === "abhinav") {
    funnyInsight = `Abhinav is leading by +${diff}% in affection points! Someone get this boy an award. 🏆💙`;
  } else if (leader === "trupti") {
    funnyInsight = `Trupti is currently +${diff}% sweeter today! Abhinav is definitely smiling at his screen. 🌸🥺`;
  } else {
    funnyInsight = "Exactly tied at the exact same percentage! Pure telepathic connection. 🔮✨";
  }

  return {
    abhinavScore,
    truptiScore,
    syncScore,
    difference: diff,
    leader,
    harmonyLevel,
    funnyInsight,
  };
}

export interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  estimatedReturn?: string;
  allowBypass?: boolean;
  lastUpdated?: string;
}

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  enabled: false,
  title: "Polishing Things Up ✨",
  message:
    "We're currently fine-tuning our little love meter to make everything smoother, sweeter, and more magical. We'll be back online very shortly!",
  estimatedReturn: "A few moments",
  allowBypass: true,
};
