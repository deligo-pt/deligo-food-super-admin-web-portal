export const dynamic = "force-dynamic";

import NumberInputStopScroll from "@/components/NumberInputStopScroll/NumberInputStopScroll";
import SonnerToaster from "@/components/SonnerToaster/SonnerToaster";
import type { Metadata } from "next";
import "./globals.css";
import { GoogleMapsProvider } from "@/store/googleProvider";

export const metadata: Metadata = {
  title: "Admin Panel | DeliGo",
  description:
    "DeliGo Super Admin Panel — Manage users, registrations, and system settings with advanced analytics and control.",
  keywords: [
    "DeliGo",
    "Super Admin",
    "Admin Dashboard",
    "User Management",
    "Analytics",
    "Admin Panel",
  ],
  authors: [{ name: "DeliGo Team", url: "https://deligo.pt" }],
  openGraph: {
    title: "Super Admin Panel | DeliGo",
    description:
      "Access the DeliGo Super Admin Panel to control users, view analytics, and manage all administrative tasks efficiently.",
    url: "https://deligo.com/admin",
    siteName: "DeliGo",
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://deligo.pt"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`} suppressHydrationWarning>
        <GoogleMapsProvider>
          {children}
          <SonnerToaster />
          <NumberInputStopScroll />
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
