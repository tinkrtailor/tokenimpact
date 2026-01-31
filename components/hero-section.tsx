/**
 * Hero section with value proposition.
 * Server component - always visible above calculator.
 */

export function HeroSection() {
  return (
    <section className="text-center mb-8 md:mb-10">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
          Compare Price Impact
        </span>
        <span className="text-foreground"> Before You Trade</span>
      </h2>
      <div className="mt-3 text-sm md:text-base text-muted-foreground/80 flex flex-col md:flex-row md:justify-center md:gap-3 gap-1.5 font-light">
        <span>Large orders move prices</span>
        <span className="hidden md:inline text-primary/60" aria-hidden="true">
          /
        </span>
        <span>Compare 3 exchanges instantly</span>
        <span className="hidden lg:inline text-primary/60" aria-hidden="true">
          /
        </span>
        <span className="hidden lg:inline">Avoid slippage surprises</span>
      </div>
    </section>
  );
}
