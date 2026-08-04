import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  metadataBase: new URL('https://itcarnival26.pstu.ac.bd'),
  title: "PSTU IT Carnival 2026 — Tech & Gaming Fest",
  description: "PSTU IT Carnival 2026 — South Zone's largest tech competition at Patuakhali Science and Technology University. Twelve events across programming, hackathon, data, quiz, security and gaming. 13–15 August 2026.",
  openGraph: {
    title: "PSTU IT Carnival 2026 — Tech & Gaming Fest",
    /* Spelled out rather than read from events.js — this is a static export
       evaluated before any of that data is in scope. It is also what a shared
       link shows, so it goes stale loudly: it was still advertising an open
       pre-registration a week after entries shut. Update it with the phase. */
    description: "South Zone's largest tech competition. Twelve events across programming, hackathon, data, quiz, security and gaming. IUPC final registration is open — pay the entry fee by 5 August 2026, 11:45 PM.",
    type: "website",
    images: [
      {
        url: '/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'PSTU IT Carnival 2026 Scrim Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/cover.jpg'],
  },
};

export const viewport = {
  themeColor: "#140d31",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
