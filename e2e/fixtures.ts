/**
 * E2E Test fixtures and helpers
 * Per specs/validation.md
 */

export const TEST_CASES = {
  validQuote: {
    symbol: "BTC-USD",
    side: "BUY" as const,
    quantity: "10",
  },
  smallQuote: {
    symbol: "ETH-USD",
    side: "SELL" as const,
    quantity: "1",
  },
  invalidSymbol: {
    symbol: "INVALID-XXX",
    side: "BUY" as const,
    quantity: "1",
  },
};

export const SELECTORS = {
  // Main page
  mainContent: "#main-content",
  skipLink: 'a[href="#main-content"]',

  // Symbol selector
  symbolSelector: "#symbol-selector",
  symbolSelectorError: "#symbol-selector-error",
  symbolSearch: '[placeholder="Search pairs..."]',
  symbolOption: (symbol: string) => `[cmdk-item][data-value="${symbol}"]`,
  symbolOptionByText: (text: string) => `[cmdk-item]:has-text("${text}")`,

  // Direction toggle
  buyButton: 'button[aria-label="Buy"]',
  sellButton: 'button[aria-label="Sell"]',
  directionGroup: '[role="group"][aria-label="Trade direction"]',

  // Quantity input
  quantityInput: "#quantity-input",
  quantityInputError: "#quantity-input-error",
  presetButton: (value: string) => `button:has-text("${value}")`,

  // Compare button
  compareButton: 'button:has-text("Compare Prices")',
  comparingButton: 'button:has-text("Comparing...")',

  // Results
  resultsAnnouncement: '[aria-live="polite"]',
  bestBadge: 'text=BEST',
  tradeButton: (exchange: string) => `button:has-text("Trade on ${exchange}")`,

  // Exchange cards (mobile)
  exchangeCard: '[class*="card"]',

  // Results table (desktop)
  resultsTable: "table",
  tableRow: "tbody tr",

  // Error states
  errorAlert: '[role="alert"]',
  retryButton: 'button:has-text("Try Again")',

  // Copy link
  copyLinkButton: 'button:has-text("Copy Link")',
  copiedButton: 'button:has-text("Copied!")',

  // Empty state
  emptyState: 'h2:has-text("What is Price Impact?")',
  quickStartBtc: 'button:has-text("Try BTC")',
  quickStartEth: 'button:has-text("Try ETH")',
  quickStartSol: 'button:has-text("Try SOL")',

  // Footer
  footer: "footer",
  footerLink: (text: string) => `footer a:has-text("${text}")`,

  // Offline banner
  offlineBanner: 'text=You are currently offline',
} as const;

export const ROUTES = {
  home: "/",
  about: "/about",
  methodology: "/methodology",
  faq: "/faq",
  privacy: "/privacy",
} as const;

export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
} as const;
