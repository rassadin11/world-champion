"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Сейчас", icon: "⚽" },
  { href: "/upcoming", label: "Предстоящие", icon: "📅" },
  { href: "/finished", label: "Завершённые", icon: "✅" },
  { href: "/table", label: "Таблица", icon: "🏆" },
] as const;

export default function NavMenu() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Десктоп: верхняя панель */}
      <header
        className="hidden md:block sticky top-0 z-30 border-b border-border bg-surface/50 backdrop-blur-xl"
        style={{ viewTransitionName: "site-header" }}
      >
        <div className="host-stripe" aria-hidden />
        <nav className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 h-16">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              transitionTypes={["nav-tab"]}
              className={`rounded-lg px-4 py-2 text-base font-semibold transition-colors ${
                isActive(it.href)
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:text-foreground hover:bg-surface-2/60"
              }`}
            >
              {it.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Мобайл: нижняя таб-панель */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-surface/50 backdrop-blur-xl"
        style={{ viewTransitionName: "site-tabbar" }}
      >
        <div className="host-stripe" aria-hidden />
        <ul className="flex">
          {ITEMS.map((it) => (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                transitionTypes={["nav-tab"]}
                className={`flex flex-col items-center gap-1 py-3 text-sm font-semibold ${
                  isActive(it.href) ? "text-accent" : "text-muted"
                }`}
              >
                <span className="text-2xl leading-none">{it.icon}</span>
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
