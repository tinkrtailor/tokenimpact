/**
 * Analytics and error tracking utilities.
 *
 * Provides a centralized interface for:
 * - Custom event tracking
 * - Error reporting
 * - Performance metrics
 *
 * Currently integrates with Vercel Analytics. Can be extended
 * to include Sentry or other providers in the future.
 */

import { track } from "@vercel/analytics";

/** Event names for type safety */
export type AnalyticsEvent =
  | "quote_requested"
  | "quote_succeeded"
  | "quote_failed"
  | "exchange_timeout"
  | "affiliate_click"
  | "copy_link"
  | "symbol_selected"
  | "direction_changed"
  | "quick_start_clicked"
  | "popular_pair_clicked";

/** Event properties type compatible with Vercel Analytics */
type EventProperties = Record<string, string | number | boolean | undefined>;

/**
 * Track a custom analytics event.
 *
 * @param event - The event name
 * @param properties - Event properties
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
): void {
  try {
    track(event, properties);
  } catch {
    // Silently fail if tracking fails - don't break the app
    console.debug("[Analytics] Failed to track event:", event);
  }
}

/**
 * Report an error for monitoring.
 *
 * In production, this would send to Sentry or similar.
 * For MVP, we log to console and could extend later.
 *
 * @param error - The error to report
 * @param context - Additional context about the error
 */
export function reportError(
  error: Error | unknown,
  context?: Record<string, unknown>
): void {
  const errorObject = error instanceof Error ? error : new Error(String(error));

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", errorObject.message, context);
  }

  // In production, this would send to error tracking service
  // e.g., Sentry.captureException(errorObject, { extra: context });

  // Track error event in analytics
  try {
    track("error", {
      message: errorObject.message,
      name: errorObject.name,
      ...(context as Record<string, string | number | boolean>),
    });
  } catch {
    // Silently fail
  }
}

/**
 * Track a page view manually (if needed).
 * Vercel Analytics handles this automatically, but
 * this can be used for virtual page views in SPAs.
 *
 * @param path - The page path
 */
export function trackPageView(path: string): void {
  try {
    track("page_view", { path });
  } catch {
    // Silently fail
  }
}
