import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hair and Care bd — Bangladesh Salon Directory & Advance Booking Platform",
  description:
    "Bangladesh's premier barbershop marketplace and instant chair reservation platform across 64 districts. Real-time queue tracker and zero fake reviews.",
  icons: {
    icon: "/assets/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth bg-[#0C1220] text-slate-100">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-[#e8220a] selection:text-white">
        {children}
      </body>
    </html>
  );
}

