// Единый слой доступа к данным из нашей БД.
// Зовётся И из API-роутов (для клиентского поллинга), И напрямую из серверных страниц.
// Никакой логики внешнего API здесь нет — только чтение нормализованной модели.
import { prisma } from "./db";
import { matchInclude, toMatchDTO } from "./serialize";
import { LIVE_STATUSES } from "./types";
import { fetchMatchDetail, hasApiKey } from "./providers/footballData";
import type {
  GroupStandingDTO,
  LiveResponse,
  MatchDTO,
  MatchDetailExtra,
  MatchesResponse,
  StandingsResponse,
} from "./types";

/** Начало суток (UTC) для переданной даты. */
function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Разбор параметра date: 'today' | 'tomorrow' | 'YYYY-MM-DD' → начало суток (UTC). */
export function resolveDate(input: string | null): Date {
  const today = startOfUtcDay(new Date());
  if (!input || input === "today") return today;
  if (input === "tomorrow") return new Date(today.getTime() + 86_400_000);
  const parsed = new Date(`${input}T00:00:00Z`);
  return isNaN(parsed.getTime()) ? today : startOfUtcDay(parsed);
}

/** YYYY-MM-DD в UTC. */
export function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Текущий live-матч; если live нет — ближайший предстоящий или последний завершённый. */
export async function getLiveMatch(): Promise<LiveResponse> {
  const live = await prisma.match.findFirst({
    where: { status: { in: LIVE_STATUSES } },
    orderBy: { utcDate: "asc" },
    include: matchInclude,
  });
  if (live) return { match: toMatchDTO(live), fallback: null };

  const upcoming = await prisma.match.findFirst({
    where: { status: { in: ["SCHEDULED", "TIMED"] } },
    orderBy: { utcDate: "asc" },
    include: matchInclude,
  });
  if (upcoming) return { match: toMatchDTO(upcoming), fallback: "upcoming" };

  const finished = await prisma.match.findFirst({
    where: { status: "FINISHED" },
    orderBy: { utcDate: "desc" },
    include: matchInclude,
  });
  if (finished) return { match: toMatchDTO(finished), fallback: "finished" };

  return { match: null, fallback: null };
}

/** Матчи за сутки (UTC), отсортированы по времени. */
export async function getMatchesByDate(input: string | null): Promise<MatchesResponse> {
  const start = resolveDate(input);
  const end = new Date(start.getTime() + 86_400_000);
  const matches = await prisma.match.findMany({
    where: { utcDate: { gte: start, lt: end } },
    orderBy: { utcDate: "asc" },
    include: matchInclude,
  });
  return { date: utcDateKey(start), matches: matches.map(toMatchDTO) };
}

/** Предстоящие матчи (не завершённые): запланированные + идущие сейчас, по времени вперёд. */
export async function getUpcomingMatches(): Promise<MatchDTO[]> {
  const matches = await prisma.match.findMany({
    where: { status: { not: "FINISHED" } },
    orderBy: { utcDate: "asc" },
    include: matchInclude,
  });
  return matches.map(toMatchDTO);
}

/** Завершённые матчи, от свежих к старым. */
export async function getFinishedMatches(): Promise<MatchDTO[]> {
  const matches = await prisma.match.findMany({
    where: { status: "FINISHED" },
    orderBy: { utcDate: "desc" },
    include: matchInclude,
  });
  return matches.map(toMatchDTO);
}

/** Один матч по id (из нашей БД), нормализованный. */
export async function getMatchById(id: number): Promise<MatchDTO | null> {
  if (!Number.isFinite(id)) return null;
  const match = await prisma.match.findUnique({
    where: { id },
    include: matchInclude,
  });
  return match ? toMatchDTO(match) : null;
}

/**
 * Доп. детали матча с внешнего API (арбитры, тур, тайм-брейк…).
 * Лучшее-усилие: без ключа или при ошибке — null, страница рендерится из БД.
 */
export async function getMatchExtra(id: number): Promise<MatchDetailExtra | null> {
  if (!hasApiKey() || !Number.isFinite(id)) return null;
  try {
    const d = await fetchMatchDetail(id);
    return {
      matchday: d.matchday ?? null,
      venue: d.venue ?? null,
      duration: d.score?.duration ?? null,
      halfTimeHome: d.score?.halfTime?.home ?? null,
      halfTimeAway: d.score?.halfTime?.away ?? null,
      referees: (d.referees ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        nationality: r.nationality ?? null,
      })),
      lastUpdated: d.lastUpdated ?? null,
    };
  } catch {
    return null;
  }
}

/** Таблицы групп + матчи плей-офф для сетки. */
export async function getStandings(): Promise<StandingsResponse> {
  const rows = await prisma.standing.findMany({
    orderBy: [{ group: "asc" }, { position: "asc" }],
    include: { team: true },
  });

  const byGroup = new Map<string, GroupStandingDTO>();
  for (const r of rows) {
    if (!byGroup.has(r.group)) byGroup.set(r.group, { group: r.group, table: [] });
    byGroup.get(r.group)!.table.push({
      position: r.position,
      team: {
        id: r.team.id,
        name: r.team.name,
        nameRu: r.team.nameRu ?? null,
        crest: r.team.crest ?? null,
        displayName: r.team.nameRu ?? r.team.name,
      },
      playedGames: r.playedGames,
      won: r.won,
      draw: r.draw,
      lost: r.lost,
      goalsFor: r.goalsFor,
      goalsAgainst: r.goalsAgainst,
      goalDifference: r.goalDifference,
      points: r.points,
    });
  }

  const playoffRaw = await prisma.match.findMany({
    where: { stage: { not: "GROUP_STAGE" } },
    orderBy: { utcDate: "asc" },
    include: matchInclude,
  });

  return {
    groups: [...byGroup.values()],
    playoff: playoffRaw.map(toMatchDTO),
  };
}
