"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MaintenanceWindow from "@/components/MaintenanceWindow";

export default function MaintenanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {/* On admin routes, we let the admin view the admin dashboard so they can manage settings */}
      {!isAdminRoute && <MaintenanceWindow />}
      {children}
    </>
  );
}
