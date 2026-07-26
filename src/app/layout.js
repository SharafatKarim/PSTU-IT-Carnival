import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "PSTU IT Carnival 2026 — Tech & Gaming Fest",
  description: "PSTU IT Carnival 2026 — South Zone's largest tech competition at Patuakhali Science and Technology University. Twelve events across programming, hackathon, data, quiz, security and gaming. 13–15 August 2026.",
  openGraph: {
    title: "PSTU IT Carnival 2026 — Tech & Gaming Fest",
    description: "South Zone's largest tech competition. Twelve events across programming, hackathon, data, quiz, security and gaming. IUPC pre-registration is open — 45 team slots, closing 31 July 2026.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#140d31",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
