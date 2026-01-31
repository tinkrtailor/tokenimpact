/**
 * Hero section with value proposition.
 * Server component - always visible above calculator.
 */

export function HeroSection() {
  return (
    <section className="text-center mb-6 md:mb-8">
      <h2 className="text-lg md:text-xl font-medium text-foreground">
        Compare Price Impact Before You Trade
      </h2>
      <div className="mt-2 text-sm text-muted-foreground flex flex-col md:flex-row md:justify-center md:gap-4 gap-1">
        <span>Large orders move prices - see how much</span>
        <span className="hidden md:inline" aria-hidden="true">
          •
        </span>
        <span>Compare Binance, Coinbase, Kraken instantly</span>
        <span className="hidden lg:inline" aria-hidden="true">
          •
        </span>
        <span className="hidden lg:inline">Avoid slippage surprises</span>
      </div>
    </section>
  );
}
