import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xfoundation",
  description: "Expert portfolio management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
