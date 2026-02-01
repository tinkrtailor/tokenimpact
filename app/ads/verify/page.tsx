import type { Metadata } from "next";
import { AdSlotStatic } from "@/components/ad-slot-static";

export const metadata: Metadata = {
  title: "A-ADS Verification",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdsVerificationPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight">A-ADS Verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Static ad slots for crawler verification. Use this exact URL in A-ADS ad unit settings.
        </p>

        <div className="mt-8 flex flex-col gap-6 items-center">
          <AdSlotStatic slotId="top-banner" />
          <AdSlotStatic slotId="results-bottom" />
          <AdSlotStatic slotId="sidebar" />
        </div>
      </div>
    </main>
  );
}
