/**
 * Affiliate redirect routes for Token Impact.
 *
 * Tracks affiliate clicks and redirects to exchange signup pages.
 * Format: /go/{exchange}?symbol=BTC-USD&side=buy&quantity=1
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/** Exchange IDs that support affiliate redirects */
type AffiliateExchangeId = 'binance' | 'coinbase' | 'kraken';

/** Affiliate signup URLs with referral parameters */
const AFFILIATE_URLS: Record<AffiliateExchangeId, string> = {
  // TODO: Replace with actual affiliate referral codes
  binance: 'https://accounts.binance.com/register?ref=TOKENIMPACT',
  coinbase: 'https://www.coinbase.com/signup?ref=TOKENIMPACT',
  kraken: 'https://www.kraken.com/sign-up?ref=TOKENIMPACT',
};

/** Session cookie name */
const SESSION_COOKIE_NAME = 'ti_session';

/** Session cookie max age (30 days) */
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

/** Schema for validating exchange param */
const ExchangeParamSchema = z.enum(['binance', 'coinbase', 'kraken']);

/** Schema for click tracking query params */
const ClickTrackingSchema = z.object({
  symbol: z.string().optional(),
  side: z.enum(['buy', 'sell']).optional(),
  quantity: z.string().optional(),
});

/**
 * Click event data for analytics.
 */
interface ClickEvent {
  exchange: AffiliateExchangeId;
  symbol: string | undefined;
  side: 'buy' | 'sell' | undefined;
  quantity: string | undefined;
  timestamp: number;
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  referrer: string | null;
}

/**
 * Generates a random session ID.
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Detects device type from user agent.
 */
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }

  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(
      ua
    )
  ) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Gets or creates a session ID from cookies.
 */
async function getOrCreateSessionId(): Promise<{
  sessionId: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  const existingSession = cookieStore.get(SESSION_COOKIE_NAME);

  if (existingSession?.value) {
    return { sessionId: existingSession.value, isNew: false };
  }

  return { sessionId: generateSessionId(), isNew: true };
}

/**
 * Logs click event for analytics.
 *
 * In production, this would send to an analytics service or database.
 * For MVP, we log to console (visible in Vercel logs).
 */
function trackClick(event: ClickEvent): void {
  // Log in structured format for easy parsing
  console.log(
    JSON.stringify({
      type: 'affiliate_click',
      ...event,
    })
  );
}

/**
 * GET /go/[exchange]
 *
 * Tracks affiliate click and redirects to exchange signup page.
 *
 * Query params:
 * - symbol: Trading pair (e.g., "BTC-USD")
 * - side: Trade direction ("buy" or "sell")
 * - quantity: Trade amount
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exchange: string }> }
): Promise<NextResponse> {
  const { exchange } = await params;

  // Validate exchange parameter
  const exchangeResult = ExchangeParamSchema.safeParse(exchange);

  if (!exchangeResult.success) {
    // Invalid exchange - redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  const validExchange = exchangeResult.data;
  const affiliateUrl = AFFILIATE_URLS[validExchange];

  // Parse tracking query params
  const searchParams = request.nextUrl.searchParams;
  const trackingData = ClickTrackingSchema.safeParse({
    symbol: searchParams.get('symbol') ?? undefined,
    side: searchParams.get('side') ?? undefined,
    quantity: searchParams.get('quantity') ?? undefined,
  });

  // Get or create session
  const { sessionId, isNew } = await getOrCreateSessionId();

  // Get device info
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  const deviceType = getDeviceType(userAgent);
  const referrer = request.headers.get('referer');

  // Track the click
  const clickEvent: ClickEvent = {
    exchange: validExchange,
    symbol: trackingData.success ? trackingData.data.symbol : undefined,
    side: trackingData.success ? trackingData.data.side : undefined,
    quantity: trackingData.success ? trackingData.data.quantity : undefined,
    timestamp: Date.now(),
    sessionId,
    deviceType,
    userAgent,
    referrer,
  };

  trackClick(clickEvent);

  // Create redirect response
  const response = NextResponse.redirect(affiliateUrl);

  // Set session cookie if new
  if (isNew) {
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return response;
}
