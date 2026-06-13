import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { getMatchById, getMatchExtra } from "@/lib/data";
import { groupRu, stageRu } from "@/lib/stage";
import { MATCH_TZ } from "@/lib/datetime";
import type { MatchDTO, MatchDetailExtra } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_RU: Record<string, string> = {
  SCHEDULED: "Запланирован",
  TIMED: "Скоро начнётся",
  IN_PLAY: "Идёт матч",
  PAUSED: "Перерыв",
  FINISHED: "Завершён",
  SUSPENDED: "Приостановлен",
  POSTPONED: "Перенесён",
  CANCELLED: "Отменён",
  AWARDED: "Тех. результат",
};

const DURATION_RU: Record<string, string> = {
  REGULAR: "Основное время",
  EXTRA_TIME: "Дополнительное время",
  PENALTY_SHOOTOUT: "Серия пенальти",
};

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
        opacity: 0.3,
        filter: "blur(30px) saturate(1.2)",
        transform: "scale(1.3)",
        maskImage: `linear-gradient(to ${side === "left" ? "right" : "left"}, black 55%, transparent 100%)`,
        WebkitMaskImage: `linear-gradient(to ${side === "left" ? "right" : "left"}, black 55%, transparent 100%)`,
      }}
      aria-hidden
    />
  );
}

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
            className="h-24 w-24 rounded-full object-cover shadow-2xl ring-2 ring-white/20 sm:h-32 sm:w-32"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-2 text-4xl sm:h-32 sm:w-32">
            ⚽
          </div>
        )}
      </ViewTransition>
      <span className="hero-shadow text-xl font-extrabold leading-tight sm:text-2xl">
        {name}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm font-medium text-muted">{label}</span>
      <span className="text-right text-base font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ScoreBlock({ match }: { match: MatchDTO }) {
  const hasScore = match.homeScore != null && match.awayScore != null;
  if (hasScore) {
    return (
      <div className="hero-shadow flex items-center justify-center gap-[0.1em] text-7xl font-black tabular-nums sm:text-8xl">
        <span>{match.homeScore}</span>
        <span className="text-accent">:</span>
        <span>{match.awayScore}</span>
      </div>
    );
  }
  if (match.status === "FINISHED") {
    return (
      <div className="text-center">
        <div className="text-5xl font-black text-muted sm:text-6xl">— : —</div>
        <p className="mt-2 text-xs text-muted">
          счёт по матчу недоступен на бесплатном тарифе
        </p>
      </div>
    );
  }
  const time = new Date(match.utcDate).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: MATCH_TZ,
  });
  return <div className="text-3xl font-bold text-accent sm:text-4xl">{time}</div>;
}

function refereeRu(extra: MatchDetailExtra): React.ReactNode {
  const main = extra.referees.find((r) => r.type === "REFEREE") ?? extra.referees[0];
  if (!main) return "—";
  return main.nationality ? `${main.name} (${main.nationality})` : main.name;
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);

  const [match, extra] = await Promise.all([
    getMatchById(matchId),
    getMatchExtra(matchId),
  ]);

  if (!match) notFound();

  const kickoff = new Date(match.utcDate).toLocaleString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: MATCH_TZ,
  });
  const hasHalfTime =
    extra?.halfTimeHome != null && extra?.halfTimeAway != null;

  return (
    <PageTransition>
    <div className="relative w-full overflow-hidden">
      {/* Фон из флагов — на всю высоту, монолитный, приглушённый */}
      <div className="pointer-events-none absolute inset-0">
        <FlagHalf crest={match.home.crest} side="left" />
        <FlagHalf crest={match.away.crest} side="right" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:pt-10 md:pb-10">
        <Link
          href="/upcoming"
          transitionTypes={["nav-back"]}
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          ← Назад
        </Link>

        {/* Шапка матча */}
        <div className="flex flex-col items-center gap-6">
          <span className="rounded-full border border-white/10 bg-surface/60 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-muted backdrop-blur">
            {match.group ? groupRu(match.group) : stageRu(match.stage)}
          </span>

          <div className="flex w-full items-start justify-center gap-6 sm:gap-12">
            <TeamSide
              name={match.home.displayName}
              crest={match.home.crest}
              vtName={`team-${match.id}-home`}
            />
            <div className="flex flex-col items-center justify-center pt-6">
              <ViewTransition
                name={`score-${match.id}`}
                share="morph"
                default="none"
              >
                <ScoreBlock match={match} />
              </ViewTransition>
            </div>
            <TeamSide
              name={match.away.displayName}
              crest={match.away.crest}
              vtName={`team-${match.id}-away`}
            />
          </div>

          <span
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              match.isLive
                ? "bg-live/15 text-live"
                : match.status === "FINISHED"
                  ? "bg-surface-2 text-muted"
                  : "bg-accent/15 text-accent"
            }`}
          >
            {match.isLive && match.minute != null
              ? `${match.minute}′`
              : STATUS_RU[match.status] ?? match.status}
          </span>
        </div>

        {/* Детали */}
        <div className="mt-10 rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur sm:p-6">
          <h2 className="mb-2 text-lg font-extrabold text-foreground">
            Информация о матче
          </h2>
          <InfoRow label="Дата и время" value={kickoff} />
          <InfoRow
            label="Стадия"
            value={stageRu(match.stage)}
          />
          {match.group && (
            <InfoRow label="Группа" value={groupRu(match.group)} />
          )}
          {extra?.matchday != null && (
            <InfoRow label="Тур" value={`${extra.matchday}-й`} />
          )}
          {hasHalfTime && (
            <InfoRow
              label="Счёт первого тайма"
              value={`${extra!.halfTimeHome} : ${extra!.halfTimeAway}`}
            />
          )}
          {extra?.duration && (
            <InfoRow
              label="Длительность"
              value={DURATION_RU[extra.duration] ?? extra.duration}
            />
          )}
          {extra?.venue && <InfoRow label="Стадион" value={extra.venue} />}
          {extra && extra.referees.length > 0 && (
            <InfoRow label="Главный арбитр" value={refereeRu(extra)} />
          )}
          <InfoRow label="Статус" value={STATUS_RU[match.status] ?? match.status} />
        </div>

        {!extra && (
          <p className="mt-4 text-center text-xs text-muted">
            Доп. детали матча недоступны (нет ключа API или матч ещё не размечен).
          </p>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
