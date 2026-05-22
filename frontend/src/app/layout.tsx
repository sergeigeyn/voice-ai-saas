import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "VoiceAI — голосовой агент для звонков",
  description: "AI-агент принимает и совершает звонки за вас. Нативный русский голос, реальный диалог, низкая задержка.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={cn(inter.variable, spaceGrotesk.variable, jetbrainsMono.variable, "font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
