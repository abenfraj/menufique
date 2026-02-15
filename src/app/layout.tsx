import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Menufique - Créez votre menu de restaurant en 5 minutes",
    template: "%s | Menufique",
  },
  description:
    "Créez un menu professionnel pour votre restaurant en moins de 5 minutes. PDF haute qualité + QR code inclus. Gratuit pour commencer.",
  keywords: [
    "menu restaurant",
    "créer menu",
    "QR code menu",
    "menu PDF",
    "carte restaurant",
    "menu digital",
  ],
  authors: [{ name: "Menufique" }],
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Menufique",
    title: "Menufique - Créez votre menu de restaurant en 5 minutes",
    description:
      "Créez un menu professionnel pour votre restaurant en moins de 5 minutes. PDF haute qualité + QR code inclus.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Menufique - Créez votre menu de restaurant en 5 minutes",
    description:
      "Créez un menu professionnel pour votre restaurant en moins de 5 minutes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
