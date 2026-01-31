"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Offline banner that shows when the user loses network connectivity.
 *
 * Features:
 * - Appears at top of screen when navigator.onLine is false
 * - Auto-dismisses when connection is restored
 * - Gray/muted styling per specs/errors.md
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-800 border-b border-zinc-700 px-4 py-2"
    >
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm text-zinc-300">
        <WifiOff className="h-4 w-4" aria-hidden="true" />
        <span>You&apos;re offline. Reconnect to continue.</span>
      </div>
    </div>
  );
}
