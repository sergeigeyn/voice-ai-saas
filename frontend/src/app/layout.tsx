import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceAI — голосовой агент для звонков",
  description: "AI-агент принимает и совершает звонки за вас. Нативный русский голос, реальный диалог, низкая задержка.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
