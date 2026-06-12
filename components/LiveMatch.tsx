"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useState } from "react";
import type { LiveResponse, MatchDTO } from "@/lib/types";
import { groupRu, stageRu } from "@/lib/stage";

type Props = { initial: LiveResponse };

/** Подпись стадии/группы матча. */
function matchLabel(match: MatchDTO): string {
  if (match.group) return groupRu(match.group);
  return stageRu(match.stage);
}

/** Половина фона: большой размытый флаг команды. */
function FlagHalf({ crest, side }: { crest: string | null; side: "left" | "right" }) {
  if (!crest) return null;
  return (
    <div
      className="absolute top-0 bottom-0 w-[58%]"
      style={{
        [side]: 0,
        backgroundImage: `url(${crest})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.5,
        filter: "blur(22px) saturate(1.2)",
        transform: "scale(1.3)",
        maskImage:
          side === "left"
            ? "linear-gradient(to right, black 55%, transparent 100%)"
            : "linear-gradient(to left, black 55%, transparent 100%)",
        WebkitMaskImage:
          side === "left"
            ? "linear-gradient(to right, black 55%, transparent 100%)"
            : "linear-gradient(to left, black 55%, transparent 100%)",
      }}
      aria-hidden
    />
  );
}

/** Колонка команды: крупный флаг + название. */
function TeamSide({
  name,
  crest,
  vtName,
}: {
  name: string;
  crest: string | null;
  vtName: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <ViewTransition name={vtName} share="morph" default="none">
        {crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={crest}
            alt={name}
            className="h-16 w-16 rounded-full object-cover shadow-2xl ring-2 ring-white/20 sm:h-24 sm:w-24 md:h-28 md:w-28"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-3xl shadow-2xl sm:h-24 sm:w-24 md:h-28 md:w-28">
            ⚽
          </div>
        )}
      </ViewTransition>
      <span className="hero-shadow text-lg font-extrabold leading-tight sm:text-2xl md:text-3xl">
        {name}
      </span>
    </div>
  );
}

export default function LiveMatch({ initial }: Props) {
  const [data, setData] = useState<LiveResponse>(initial);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) return;
        const next: LiveResponse = await res.json();
        if (active) setData(next);
      } catch {
        // тихо игнорируем сетевые сбои опроса
      }
    };
    const id = setInterval(tick, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const { match, fallback } = data;

  if (!match) {
    return (
      <section className="flex h-[100dvh] flex-col items-center justify-center px-6 text-center md:h-[calc(100dvh-4rem)]">
        <span className="text-7xl">⚽</span>
        <p className="mt-6 text-2xl font-bold text-muted">Сейчас матчей нет</p>
      </section>
    );
  }

  const hasScore = match.homeScore != null && match.awayScore != null;
  const kickoffTime = new Date(match.utcDate).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const kickoffDate = new Date(match.utcDate).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
  });

  return (
    <section className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden md:h-[calc(100dvh-4rem)]">
      {/* Фон: большие размытые флаги + затемнение */}
      <div className="pointer-events-none absolute inset-0">
        <FlagHalf crest={match.home.crest} side="left" />
        <FlagHalf crest={match.away.crest} side="right" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/45 to-background/85" />
        <div className="absolute inset-0 bg-background/10" />
      </div>

      {/* Передний план */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-6 sm:gap-8">
        {/* Статусная плашка */}
        <div className="hero-shadow flex items-center gap-2.5 rounded-full border border-white/10 bg-surface/50 px-5 py-2 text-sm font-semibold backdrop-blur-md sm:text-base">
          {match.isLive ? (
            <>
              <span className="live-dot h-3 w-3 rounded-full bg-live" aria-hidden />
              <span className="font-extrabold uppercase tracking-wider text-live">
                Live
              </span>
              <span className="text-foreground">
                {match.minute != null ? `${match.minute}'` : match.status}
              </span>
              <span className="text-muted">·</span>
              <span className="text-muted">{matchLabel(match)}</span>
            </>
          ) : fallback === "upcoming" ? (
            <>
              <span className="font-extrabold uppercase tracking-wider text-accent">
                Ближайший матч
              </span>
              <span className="text-muted">·</span>
              <span className="text-muted">{kickoffDate}</span>
            </>
          ) : (
            <>
              <span className="font-extrabold uppercase tracking-wider text-muted">
                Последний матч
              </span>
              <span className="text-muted">·</span>
              <span className="text-muted">{matchLabel(match)}</span>
            </>
          )}
        </div>

        {/* Команды */}
        <div className="flex w-full items-start justify-center gap-6 sm:gap-16">
          <TeamSide
            name={match.home.displayName}
            crest={match.home.crest}
            vtName={`team-${match.id}-home`}
          />
          <TeamSide
            name={match.away.displayName}
            crest={match.away.crest}
            vtName={`team-${match.id}-away`}
          />
        </div>

        {/* Гигантский счёт / время */}
        <ViewTransition name={`score-${match.id}`} share="morph" default="none">
          {hasScore ? (
            <div className="score-mega hero-shadow flex items-center justify-center gap-[0.06em] text-foreground">
              <span>{match.homeScore}</span>
              <span className="text-accent">:</span>
              <span>{match.awayScore}</span>
            </div>
          ) : match.isLive ? (
            <div className="score-mega hero-shadow text-foreground">0:0</div>
          ) : (
            <div className="hero-shadow flex flex-col items-center leading-none">
              <span
                className="font-black tabular-nums text-foreground"
                style={{ fontSize: "clamp(4rem, 22vw, 16rem)", letterSpacing: "-0.04em" }}
              >
                {kickoffTime}
              </span>
            </div>
          )}
        </ViewTransition>

        {/* Подпись */}
        <p className="hero-shadow text-sm font-semibold uppercase tracking-[0.3em] text-muted sm:text-base">
          {match.isLive
            ? "Сейчас в игре"
            : fallback === "upcoming"
              ? "Скоро начало"
              : "Матч завершён"}
        </p>

        <Link
          href={`/match/${match.id}`}
          transitionTypes={["nav-forward"]}
          className="rounded-full border border-white/15 bg-surface/50 px-5 py-2 text-sm font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-surface-2/70"
        >
          Подробнее о матче →
        </Link>
      </div>
    </section>
  );
}
