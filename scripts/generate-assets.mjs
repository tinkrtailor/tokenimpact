#!/usr/bin/env node
/**
 * Generate brand assets for Token Impact
 * Run with: node scripts/generate-assets.mjs
 *
 * Generates:
 * - icon-192.png (PWA)
 * - icon-512.png (PWA)
 * - og-image.png (Open Graph)
 * - favicon.ico (legacy browsers)
 * - apple-touch-icon.png (iOS)
 */

import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const imagesDir = join(publicDir, "images", "logo");

// Brand colors
const VOID_BLACK = "#09090b";
const ELECTRIC_CYAN = "#22d3ee";
const WHITE = "#fafafa";

/**
 * Generate the impact rings SVG at given size
 */
function generateIconSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${VOID_BLACK}"/>
  <circle cx="${cx}" cy="${cy}" r="${12 * scale}" fill="none" stroke="${ELECTRIC_CYAN}" stroke-width="${1 * scale}" opacity="0.3"/>
  <circle cx="${cx}" cy="${cy}" r="${8 * scale}" fill="none" stroke="${ELECTRIC_CYAN}" stroke-width="${1.5 * scale}" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${4 * scale}" fill="none" stroke="${ELECTRIC_CYAN}" stroke-width="${2 * scale}" opacity="0.7"/>
  <circle cx="${cx}" cy="${cy}" r="${2 * scale}" fill="${ELECTRIC_CYAN}"/>
</svg>`;
}

/**
 * Generate the OG image SVG
 */
function generateOgImageSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Grid pattern for subtle background -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${ELECTRIC_CYAN}" stroke-width="0.5" opacity="0.1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="${VOID_BLACK}"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Impact rings in background - right side -->
  <circle cx="950" cy="315" r="250" fill="none" stroke="${ELECTRIC_CYAN}" stroke-width="2" opacity="0.15"/>
  <circle cx="950" cy="315" r="180" fill="none" stroke="${ELECTRIC_CYAN}" stroke-width="2" opacity="0.2"/>
  <circle cx="950" cy="315" r="110" fill="none" stroke="${ELECTRIC_CYAN}" stroke-width="3" opacity="0.25"/>
  <circle cx="950" cy="315" r="50" fill="${ELECTRIC_CYAN}" opacity="0.3"/>

  <!-- Logo text -->
  <text x="80" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="${WHITE}">
    <tspan>T</tspan><tspan fill="${ELECTRIC_CYAN}">o</tspan><tspan>ken Impact</tspan>
  </text>

  <!-- Divider line -->
  <line x1="80" y1="230" x2="480" y2="230" stroke="${ELECTRIC_CYAN}" stroke-width="3" opacity="0.8"/>

  <!-- Tagline -->
  <text x="80" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="${WHITE}" opacity="0.9">Compare Crypto Liquidity</text>
  <text x="80" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="${WHITE}" opacity="0.9">Across Exchanges</text>

  <!-- Exchange badges -->
  <g transform="translate(80, 420)">
    <rect x="0" y="0" width="120" height="44" rx="8" fill="${WHITE}" opacity="0.1"/>
    <text x="60" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${WHITE}" text-anchor="middle">Binance</text>

    <rect x="140" y="0" width="120" height="44" rx="8" fill="${WHITE}" opacity="0.1"/>
    <text x="200" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${WHITE}" text-anchor="middle">Coinbase</text>

    <rect x="280" y="0" width="120" height="44" rx="8" fill="${WHITE}" opacity="0.1"/>
    <text x="340" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${WHITE}" text-anchor="middle">Kraken</text>
  </g>

  <!-- URL -->
  <text x="80" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${ELECTRIC_CYAN}" opacity="0.8">tokenimpact.com</text>
</svg>`;
}

/**
 * Generate the full wordmark logo SVG
 */
function generateFullLogoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" width="200" height="40">
  <!-- Logo text with accent on "o" -->
  <text x="0" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="${WHITE}">
    <tspan>T</tspan><tspan fill="${ELECTRIC_CYAN}">o</tspan><tspan>ken Impact</tspan>
  </text>
</svg>`;
}

/**
 * Generate the compact logo SVG
 */
function generateCompactLogoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 32" width="140" height="32">
  <text x="0" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="${WHITE}">
    <tspan>T</tspan><tspan fill="${ELECTRIC_CYAN}">o</tspan><tspan>ken Impact</tspan>
  </text>
</svg>`;
}

/**
 * Generate the icon-only logo SVG
 */
function generateIconLogoSvg() {
  return generateIconSvg(512);
}

/**
 * Generate monochrome logo SVG
 */
function generateMonoLogoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" width="200" height="40">
  <text x="0" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="currentColor">
    Token Impact
  </text>
</svg>`;
}

async function generateAssets() {
  console.log("Generating brand assets...\n");

  // Ensure directories exist
  if (!existsSync(imagesDir)) {
    await mkdir(imagesDir, { recursive: true });
  }

  // Generate PWA icons
  console.log("Generating PWA icons...");
  const icon192Svg = generateIconSvg(192);
  const icon512Svg = generateIconSvg(512);

  await sharp(Buffer.from(icon192Svg))
    .png()
    .toFile(join(publicDir, "icon-192.png"));
  console.log("  - icon-192.png");

  await sharp(Buffer.from(icon512Svg))
    .png()
    .toFile(join(publicDir, "icon-512.png"));
  console.log("  - icon-512.png");

  // Generate apple-touch-icon
  console.log("Generating apple-touch-icon...");
  const appleSvg = generateIconSvg(180);
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(join(publicDir, "apple-touch-icon.png"));
  console.log("  - apple-touch-icon.png");

  // Generate favicon.ico (32x32)
  console.log("Generating favicon...");
  const favicon32Svg = generateIconSvg(32);
  await sharp(Buffer.from(favicon32Svg))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, "favicon-32.png"));

  // For ICO, we'll use PNG as fallback - modern browsers prefer SVG anyway
  // Copy as favicon.ico for older browsers that need it
  await sharp(Buffer.from(favicon32Svg))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, "favicon.ico"));
  console.log("  - favicon.ico");

  // Clean up temp file
  const fs = await import("fs/promises");
  await fs.unlink(join(publicDir, "favicon-32.png")).catch(() => {});

  // Generate OG image
  console.log("Generating OG image...");
  const ogSvg = generateOgImageSvg();
  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(join(publicDir, "og-image.png"));
  console.log("  - og-image.png");

  // Generate logo SVGs
  console.log("Generating logo SVGs...");
  await writeFile(join(imagesDir, "logo-full.svg"), generateFullLogoSvg());
  console.log("  - logo-full.svg");

  await writeFile(join(imagesDir, "logo-compact.svg"), generateCompactLogoSvg());
  console.log("  - logo-compact.svg");

  await writeFile(join(imagesDir, "logo-icon.svg"), generateIconLogoSvg());
  console.log("  - logo-icon.svg");

  await writeFile(join(imagesDir, "logo-mono.svg"), generateMonoLogoSvg());
  console.log("  - logo-mono.svg");

  console.log("\nDone! All assets generated.");
}

generateAssets().catch(console.error);
