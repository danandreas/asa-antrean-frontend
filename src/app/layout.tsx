import { AuthProvider } from "@/lib/auth-context";
import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "ASA Antrean Online",
  description: "Aplikasi antrean klinik berbasis cloud",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e104e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geomini:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white sm:my-6 sm:min-h-[calc(100dvh-3rem)] sm:rounded-[2.5rem] sm:border sm:border-black/5 sm:shadow-2xl sm:shadow-[#1e104e]/10">
            {children}
          </div>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3200,
            style: {
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              borderRadius: "14px",
              background: "#1e104e",
              color: "#ffffff",
              padding: "10px 16px",
            },
            success: {
              iconTheme: { primary: "#ff653f", secondary: "#ffffff" },
            },
            error: {
              iconTheme: { primary: "#ffffff", secondary: "#dc2626" },
              style: {
                background: "#dc2626",
                color: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
