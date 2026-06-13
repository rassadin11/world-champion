import Link from "next/link";
import type { MatchDTO, TeamDTO } from "@/lib/types";
import { PLAYOFF_ORDER, stageRu } from "@/lib/stage";
import { MATCH_TZ } from "@/lib/datetime";

type Props = {
  matches: MatchDTO[];
};

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: MATCH_TZ,
  });
}

function TeamSide({
  team,
  score,
  isWinner,
}: {
  team: TeamDTO;
  score: number | null;
  isWinner: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        isWinner ? "font-bold text-foreground" : "text-foreground"
      }`}
    >
      {team.crest ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.crest}
          alt=""
          className="h-6 w-6 shrink-0 rounded-sm object-contain"
        />
      ) : (
        <span className="h-6 w-6 shrink-0 rounded-sm bg-surface-2" />
      )}
      <span className="flex-1 truncate text-base">{team.displayName}</span>
      {score !== null && (
        <span className="shrink-0 text-base font-bold tabular-nums">{score}</span>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: MatchDTO }) {
  const finished = match.status === "FINISHED";
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const decided =
    finished &&
    hasScore &&
    match.homeScore !== match.awayScore;
  const homeWins = decided && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWins = decided && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-xl border border-border bg-surface p-3 transition-colors hover:border-pitch/60 hover:bg-surface-2/40"
    >
      <div className="space-y-2">
        <TeamSide
          team={match.home}
          score={hasScore ? match.homeScore : null}
          isWinner={homeWins}
        />
        <TeamSide
          team={match.away}
          score={hasScore ? match.awayScore : null}
          isWinner={awayWins}
        />
      </div>
      {!hasScore && (
        <div className="mt-1 text-center text-xs text-muted">
          {formatKickoff(match.utcDate)}
        </div>
      )}
    </Link>
  );
}

export default function PlayoffBracket({ matches }: Props) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-lg text-muted">
        Сетка плей-офф появится после группового этапа
      </div>
    );
  }

  const stages = PLAYOFF_ORDER.filter((stage) =>
    matches.some((m) => m.stage === stage),
  );

  return (
    <div className="flex flex-col gap-4 overflow-x-auto md:flex-row md:gap-6">
      {stages.map((stage) => {
        const stageMatches = matches.filter((m) => m.stage === stage);
        return (
          <div
            key={stage}
            className="flex min-w-[14rem] flex-col gap-3 md:min-w-[16rem]"
          >
            <h3 className="text-lg font-extrabold text-accent">
              {stageRu(stage)}
            </h3>
            <div className="flex flex-col justify-around gap-3">
              {stageMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
