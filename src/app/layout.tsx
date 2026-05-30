import type { Metadata } from "next";
import { Outfit, Lexend } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Accessible Learning Material Generator | Support for Dyslexia",
  description: "An AI-powered learning assistant designed for students with dyslexia. Transform text into simplified formats, summaries, key points, and interactive revision quizzes.",
  keywords: ["dyslexia", "accessibility", "learning disability", "study tools", "gemini ai", "education", "quiz generator"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${lexend.variable}`} suppressHydrationWarning>
      <body className="font-outfit" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
