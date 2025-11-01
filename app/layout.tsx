import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Admin Panel | DeliGo",
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
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
