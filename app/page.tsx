export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-semibold text-text-primary">Token Impact</h1>
      <p className="mt-4 text-text-secondary">
        Crypto price impact calculator
      </p>
      <div className="mt-8 flex gap-4">
        <span className="rounded-md bg-accent px-4 py-2 font-mono text-accent-foreground">
          BUY
        </span>
        <span className="rounded-md bg-accent-alt px-4 py-2 font-mono text-accent-alt-foreground">
          SELL
        </span>
      </div>
    </main>
  );
}
