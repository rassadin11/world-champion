import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import NavMenu from "@/components/NavMenu";

const montserrat = Montserrat({
  variable: "--font-app-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ЧМ-2026 — Сейчас в игре",
  description:
    "Чемпионат мира по футболу 2026: живые матчи, расписание на сегодня и завтра, турнирные таблицы.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavMenu />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
