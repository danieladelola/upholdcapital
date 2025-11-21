import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import ClientClerkProvider from "@/components/ClientClerkProvider";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  // Use a client-only wrapper component when the publishable key exists.
  // This avoids importing Clerk on the server when env vars are missing.

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {hasClerkKey ? (
          <ClientClerkProvider>
            <Toaster />
            {children}
          </ClientClerkProvider>
        ) : (
          // Dev fallback: render children without Clerk when publishable key is missing
          <>
            <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded bg-yellow-300 text-black text-sm">
              Dev: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set — auth disabled
            </div>
            <Toaster />
            {children}
          </>
        )}
      </body>
    </html>
  )
}
