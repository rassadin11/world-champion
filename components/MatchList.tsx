import { ViewTransition } from "react";
import Link from "next/link";
import type { MatchDTO, TeamDTO } from "@/lib/types";
import { groupRu, stageRu } from "@/lib/stage";

// Список матчей за один день. Server-safe: без "use client", без хуков.

function TeamFlag({ team }: { team: TeamDTO }) {
  if (!team.crest) {
    return (
      <span
        className="inline-block h-8 w-11 shrink-0 rounded-md border border-border bg-surface-2"
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={team.crest}
      alt=""
      width={44}
      height={32}
      className="h-8 w-11 shrink-0 rounded-md object-cover shadow"
    />
  );
}

function StatusChip({ match }: { match: MatchDTO }) {
  if (match.isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-live">
        <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-live" />
        LIVE
      </span>
    );
  }
  if (match.status === "FINISHED") {
    return <span className="text-sm font-medium text-muted">Завершён</span>;
  }
  const label = match.group ? groupRu(match.group) : stageRu(match.stage);
  return <span className="text-sm font-medium text-muted">{label}</span>;
}

function Center({ match }: { match: MatchDTO }) {
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  if (hasScore) {
    return (
      <span className="text-3xl font-black tabular-nums text-foreground sm:text-4xl">
        {match.homeScore} : {match.awayScore}
      </span>
    );
  }
  const time = new Date(match.utcDate).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <span className="text-xl font-bold tabular-nums text-accent sm:text-2xl">
      {time}
    </span>
  );
}

export default function MatchList({ matches }: { matches: MatchDTO[] }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-lg text-muted">
        На эту дату матчей нет
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {matches.map((match) => (
        <li key={match.id}>
          <Link
            href={`/match/${match.id}`}
            transitionTypes={["nav-forward"]}
            className="block rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-pitch/60 hover:bg-surface-2/40 sm:p-5"
          >
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Хозяева */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <ViewTransition
                name={`team-${match.id}-home`}
                share="morph"
                default="none"
              >
                <TeamFlag team={match.home} />
              </ViewTransition>
              <span className="truncate text-base font-semibold text-foreground sm:text-lg">
                {match.home.displayName}
              </span>
            </div>

            {/* Центр: счёт или время */}
            <div className="shrink-0 px-2 text-center sm:px-4">
              <ViewTransition
                name={`score-${match.id}`}
                share="morph"
                default="none"
              >
                <Center match={match} />
              </ViewTransition>
            </div>

            {/* Гости */}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
              <span className="truncate text-right text-base font-semibold text-foreground sm:text-lg">
                {match.away.displayName}
              </span>
              <ViewTransition
                name={`team-${match.id}-away`}
                share="morph"
                default="none"
              >
                <TeamFlag team={match.away} />
              </ViewTransition>
            </div>
          </div>

          {/* Статус */}
          <div className="mt-3 flex justify-center">
            <StatusChip match={match} />
          </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
