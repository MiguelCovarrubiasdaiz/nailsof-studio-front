import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import ProtectedLayout from "@/components/ProtectedLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beauty Salon - Sistema de Citas",
  description: "Sistema de gestión para salones de belleza y estética",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ProtectedLayout>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
