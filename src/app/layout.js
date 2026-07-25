import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "PSTU IT Carnival 2026 — Tech & Gaming Fest",
  description: "PSTU IT Carnival 2026 — South Zone's largest tech competition at Patuakhali Science and Technology University. Eleven events across programming, hackathon, data, quiz and gaming. 13–15 August 2026.",
  themeColor: "#140d31",
  openGraph: {
    title: "PSTU IT Carnival 2026 — Tech & Gaming Fest",
    description: "South Zone's largest tech competition. Eleven events, ৳450K+ prize pool. IUPC pre-registration open now — register your team online.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
