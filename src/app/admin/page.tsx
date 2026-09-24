"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Trash2,
  AlertTriangle,
  Shield,
  Calendar,
  TrendingUp,
  Trophy,
  ThermometerSun,
  Flame,
  X,
  MessageSquareHeart,
  Power,
  Wrench,
  Sparkles,
  Clock,
  CheckCircle2,
  Edit3,
  Sliders,
  ChevronDown,
} from "lucide-react";
import {
  fetchAllUpdates,
  deleteSingleUpdate,
  clearAllHistory,
  getHistoryStats,
} from "@/lib/storage";
import { isAdminAuthenticated, clearAuthenticatedSession, AuthRole } from "@/lib/auth";
import {
  LoveUpdate,
  formatHistoryDate,
  formatPercentageValue,
  MaintenanceConfig,
  DEFAULT_MAINTENANCE_CONFIG,
} from "@/types";
import {
  fetchMaintenanceConfig,
  updateMaintenanceConfig,
} from "@/lib/maintenance";
import PetalParticles from "@/components/PetalParticles";
import AuthModal from "@/components/AuthModal";

export default function AdminPage() {
  const router = useRouter();
  const [updates, setUpdates] = useState<LoveUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Maintenance Window State
  const [mConfig, setMConfig] = useState<MaintenanceConfig>(DEFAULT_MAINTENANCE_CONFIG);
  const [isUpdatingMaint, setIsUpdatingMaint] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [customReturn, setCustomReturn] = useState("");
  const [showMaintDetails, setShowMaintDetails] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [data, mData] = await Promise.all([
        fetchAllUpdates(),
        fetchMaintenanceConfig(),
      ]);
      setUpdates(data);
      setMConfig(mData);
      setCustomTitle(mData.title);
      setCustomMsg(mData.message);
      setCustomReturn(mData.estimatedReturn || "");
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      setIsAuthModalOpen(true);
    }
    loadData();
  }, [loadData]);

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 2500);
  };

  const handleToggleMaintenance = async () => {
    setIsUpdatingMaint(true);
    try {
      const nextState = !mConfig.enabled;
      const updated = await updateMaintenanceConfig({
        enabled: nextState,
        title: customTitle.trim() || DEFAULT_MAINTENANCE_CONFIG.title,
        message: customMsg.trim() || DEFAULT_MAINTENANCE_CONFIG.message,
        estimatedReturn: customReturn.trim() || DEFAULT_MAINTENANCE_CONFIG.estimatedReturn,
      });
      setMConfig(updated);
      showStatus(
        nextState
          ? "Maintenance Window activated 🛠️"
          : "Maintenance Window turned OFF ✨ Site is live!"
      );
    } catch {
      showStatus("Failed to toggle maintenance mode.");
    } finally {
      setIsUpdatingMaint(false);
    }
  };

  const handleSaveMaintenanceDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingMaint(true);
    try {
      const updated = await updateMaintenanceConfig({
        title: customTitle.trim() || DEFAULT_MAINTENANCE_CONFIG.title,
        message: customMsg.trim() || DEFAULT_MAINTENANCE_CONFIG.message,
        estimatedReturn: customReturn.trim() || DEFAULT_MAINTENANCE_CONFIG.estimatedReturn,
      });
      setMConfig(updated);
      showStatus("Maintenance settings saved 💾");
    } catch {
      showStatus("Failed to save maintenance settings.");
    } finally {
      setIsUpdatingMaint(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setDeletingId(id);
    const res = await deleteSingleUpdate(id);
    if (res.success) {
      setUpdates((prev) => prev.filter((u) => u.id !== id));
      showStatus("Entry deleted 🗑️");
    } else {
      showStatus(res.error || "Failed to delete entry.");
    }
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    const res = await clearAllHistory();
    setShowClearConfirm(false);
    if (res.success) {
      setUpdates([]);
      showStatus(`Cleared ${res.deletedCount} entries 🧹`);
    } else {
      showStatus(res.error || "Could not clear history.");
    }
  };

  const stats = getHistoryStats(updates);

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10 selection:bg-[#EBC7CE] overflow-x-hidden">
      <PetalParticles />

      {/* Top Header */}
      <div className="z-10 w-full max-w-lg flex items-center justify-between mb-4">
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
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[#D88C9A]" />
          <span className="text-xs font-semibold tracking-widest uppercase text-[#7A7276]">
            Admin
          </span>
        </div>
        <button
          onClick={() => {
            clearAuthenticatedSession();
            router.push("/");
          }}
          className="text-xs text-[#7A7276] hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 cursor-pointer"
        >
          Lock
        </button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-lg text-center mb-5"
      >
        <h1 className="text-2xl sm:text-3xl font-serif text-[#242124]">
          Admin Dashboard
        </h1>
        <p className="text-xs text-[#7A7276] mt-1">
          Manage entries, view stats & clear history
        </p>
      </motion.div>

      {/* Status Toast */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="z-20 fixed top-6 left-1/2 -translate-x-1/2 bg-[#242124] text-white text-xs font-medium py-2.5 px-5 rounded-full shadow-lg"
          >
            {statusMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Window Control Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="z-10 w-full max-w-lg mb-5"
      >
        <div className="rounded-3xl bg-[#FFF7F8] border border-[#EBC7CE] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2.5 rounded-2xl ${
                  mConfig.enabled
                    ? "bg-[#D88C9A]/15 text-[#D88C9A]"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Wrench size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#242124]">
                    Maintenance Window
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      mConfig.enabled
                        ? "bg-[#D88C9A]/20 text-[#D88C9A]"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        mConfig.enabled
                          ? "bg-[#D88C9A] animate-pulse"
                          : "bg-emerald-500"
                      }`}
                    />
                    {mConfig.enabled ? "Active" : "Off (Live)"}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A7276] mt-0.5">
                  {mConfig.enabled
                    ? "Visitors see the Under Maintenance window"
                    : "Website is public and fully accessible"}
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={handleToggleMaintenance}
              disabled={isUpdatingMaint}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer touch-manipulation shadow-xs flex items-center gap-1.5 shrink-0 ${
                mConfig.enabled
                  ? "bg-[#242124] hover:bg-black text-white"
                  : "bg-[#D88C9A] hover:bg-[#C97B89] text-white"
              }`}
            >
              <Power size={12} />
              <span>{mConfig.enabled ? "Turn OFF" : "Turn ON"}</span>
            </button>
          </div>

          {/* Expandable Maintenance Window Settings */}
          <div className="mt-3 pt-3 border-t border-[#EBC7CE]/40">
            <button
              type="button"
              onClick={() => setShowMaintDetails(!showMaintDetails)}
              className="w-full flex items-center justify-between text-xs text-[#7A7276] hover:text-[#242124] transition-colors py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Edit3 size={12} className="text-[#D88C9A]" />
                Customize Maintenance Window Text
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  showMaintDetails ? "rotate-180" : ""
                }`}
              />
            </button>

            {showMaintDetails && (
              <form onSubmit={handleSaveMaintenanceDetails} className="mt-3 space-y-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#7A7276] mb-1">
                    Window Title
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Polishing Things Up ✨"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EBC7CE]/80 text-[#242124] focus:outline-none focus:border-[#D88C9A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7A7276] mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    rows={2}
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="Message shown to visitors..."
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EBC7CE]/80 text-[#242124] focus:outline-none focus:border-[#D88C9A] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7A7276] mb-1">
                    Estimated Return
                  </label>
                  <input
                    type="text"
                    value={customReturn}
                    onChange={(e) => setCustomReturn(e.target.value)}
                    placeholder="e.g. In a few moments"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EBC7CE]/80 text-[#242124] focus:outline-none focus:border-[#D88C9A]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTitle(DEFAULT_MAINTENANCE_CONFIG.title);
                      setCustomMsg(DEFAULT_MAINTENANCE_CONFIG.message);
                      setCustomReturn(DEFAULT_MAINTENANCE_CONFIG.estimatedReturn || "");
                    }}
                    className="px-3 py-1.5 rounded-full text-[11px] text-[#7A7276] hover:bg-[#EBC7CE]/30 transition-colors cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingMaint}
                    className="px-4 py-1.5 rounded-full bg-[#D88C9A] hover:bg-[#C97B89] text-white text-[11px] font-semibold tracking-wide transition-all active:scale-95 shadow-2xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!isLoading && updates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="z-10 w-full max-w-lg grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5"
        >
          <StatCard
            icon={<Calendar size={15} />}
            label="Total Entries"
            value={String(stats.total)}
          />
          <StatCard
            icon={<TrendingUp size={15} />}
            label="Average"
            value={`${formatPercentageValue(stats.average)}%`}
          />
          <StatCard
            icon={<Trophy size={15} />}
            label="Highest"
            value={
              stats.highest
                ? `${formatPercentageValue(stats.highest.value)}%`
                : "—"
            }
            sub={
              stats.highest
                ? new Date(stats.highest.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : undefined
            }
          />
          <StatCard
            icon={<ThermometerSun size={15} />}
            label="Lowest"
            value={
              stats.lowest
                ? `${formatPercentageValue(stats.lowest.value)}%`
                : "—"
            }
            sub={
              stats.lowest
                ? new Date(stats.lowest.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : undefined
            }
          />
        </motion.div>
      )}

      {/* Streak Badge */}
      {!isLoading && stats.streak >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 mb-4 flex items-center gap-1.5 bg-[#FFF7F8] border border-[#EBC7CE]/50 rounded-full px-4 py-1.5 shadow-xs"
        >
          <Flame size={14} className="text-[#D88C9A]" />
          <span className="text-xs font-medium text-[#242124]">
            {stats.streak}-day streak! 🔥
          </span>
        </motion.div>
      )}

      {/* Danger Zone: Clear All */}
      {!isLoading && updates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="z-10 w-full max-w-lg mb-5"
        >
          <div className="rounded-2xl bg-red-50/70 border border-red-200/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700">
                  Danger Zone
                </p>
                <p className="text-[11px] text-red-500">
                  Permanently delete all {updates.length} entries
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold tracking-wide active:scale-95 transition-all touch-manipulation cursor-pointer shadow-sm"
            >
              Clear All History
            </button>
          </div>
        </motion.div>
      )}

      {/* Entries List */}
      <div className="z-10 w-full max-w-lg flex flex-col gap-2.5 mb-10">
        {isLoading ? (
          <div className="text-center py-16 text-sm text-[#7A7276] animate-pulse">
            Loading entries...
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#7A7276] font-light">
            No entries to manage.
            <div className="mt-3">
              <Link
                href="/"
                className="text-xs text-[#D88C9A] underline hover:text-[#C97B89] touch-manipulation"
              >
                Go home
              </Link>
            </div>
          </div>
        ) : (
          updates.map((entry, index) => {
            const dateInfo = formatHistoryDate(entry.created_at);
            const isDeleting = deletingId === entry.id;

            return (
              <motion.div
                key={entry.id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="w-full rounded-2xl bg-[#FFF7F8]/90 border border-[#EBC7CE]/40 p-3.5 sm:p-4 shadow-xs backdrop-blur-xs flex items-start justify-between gap-3 hover:border-[#D88C9A]/50 transition-colors"
              >
                {/* Left: Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar size={12} className="text-[#D88C9A] shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-[#242124]">
                      {dateInfo.main}
                    </span>
                    {dateInfo.sub && (
                      <span className="text-[10px] text-[#9B9499]">
                        • {dateInfo.sub}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-lg font-serif text-[#242124]">
                      {formatPercentageValue(entry.percentage)}
                    </span>
                    <span className="text-xs text-[#D88C9A]">%</span>
                  </div>

                  {entry.message && (
                    <div className="flex items-start gap-1.5">
                      <MessageSquareHeart
                        size={11}
                        className="text-[#D88C9A] mt-0.5 shrink-0"
                      />
                      <p className="text-[11px] text-[#6E676C] italic leading-relaxed truncate">
                        &ldquo;{entry.message}&rdquo;
                      </p>
                    </div>
                  )}

                  <p className="text-[9px] text-[#9B9499] mt-1 font-mono">
                    ID: {entry.id?.slice(0, 8)}...
                  </p>
                </div>

                {/* Right: Delete Button */}
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  disabled={isDeleting}
                  aria-label={`Delete entry from ${dateInfo.main}`}
                  className="shrink-0 p-2.5 rounded-full text-[#9B9499] hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all touch-manipulation cursor-pointer disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="z-10 mt-auto pb-4 flex gap-4">
        <Link
          href="/"
          className="text-xs text-[#7A7276] hover:text-[#242124] border-b border-transparent hover:border-[#D88C9A] transition-all touch-manipulation py-1"
        >
          Return home
        </Link>
        <Link
          href="/history"
          className="text-xs text-[#7A7276] hover:text-[#242124] border-b border-transparent hover:border-[#D88C9A] transition-all touch-manipulation py-1"
        >
          View history
        </Link>
      </div>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="fixed inset-0 bg-[#242124]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl z-10 flex flex-col items-center text-center"
            >
              <button
                onClick={() => setShowClearConfirm(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-[#7A7276] hover:text-[#242124] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <AlertTriangle size={22} className="text-red-500" />
              </div>

              <h3 className="text-lg font-serif text-[#242124] mb-1">
                Clear all history?
              </h3>
              <p className="text-xs text-[#7A7276] mb-5 leading-relaxed max-w-xs">
                This will permanently delete all{" "}
                <strong>{updates.length}</strong> entries from both the database
                and local storage. This action cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#EBC7CE] text-xs font-semibold text-[#242124] hover:bg-gray-50 active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-xs font-semibold text-white active:scale-[0.98] transition-all touch-manipulation cursor-pointer shadow-sm"
                >
                  Delete Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Auth Gate */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          router.push("/");
        }}
        onSuccess={(role: AuthRole) => {
          setIsAuthModalOpen(false);
          if (role !== "admin") {
            // Wrong role — redirect Trupti to update page
            router.push("/update");
          }
        }}
      />
    </main>
  );
}

// ─── Stat Card Component ───────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FFF7F8]/90 border border-[#EBC7CE]/40 p-3 shadow-xs flex flex-col items-center text-center gap-1">
      <div className="text-[#D88C9A]">{icon}</div>
      <p className="text-[10px] uppercase tracking-wider text-[#7A7276] font-medium">
        {label}
      </p>
      <p className="text-base font-serif text-[#242124] font-medium">
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-[#9B9499]">{sub}</p>
      )}
    </div>
  );
}
