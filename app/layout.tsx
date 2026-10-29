import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hair and Care bd | Book Top Salons, Barbershops & Grooming Studios",
  description:
    "Discover and instantly book top-rated salons, barbershops, medspas, and beauty wellness studios across Bangladesh. Real-time chair queue tracker and verified bookings.",
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
    <html lang="en" className="scroll-smooth bg-white text-[#0D0D0D]">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=boska@400,500,600,700,900&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-[#0D0D0D] selection:text-white bg-white text-[#0D0D0D]">
        {children}
      </body>
    </html>
  );
}
