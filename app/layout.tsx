import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Token Impact",
  description: "Crypto price impact calculator - compare exchange liquidity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
