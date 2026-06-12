// Нормализованная модель, которую API-роуты отдают клиенту.
// Это КОНТРАКТ между бэком и UI: компоненты типизируются только этими типами,
// напрямую к Prisma-моделям не обращаются.

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED";

// «Сейчас в игре» = IN_PLAY | PAUSED
export const LIVE_STATUSES: MatchStatus[] = ["IN_PLAY", "PAUSED"];

export type TeamDTO = {
  id: number;
  name: string; // англ.
  nameRu: string | null; // рус. (если есть в словаре)
  crest: string | null; // URL флага
  /** Что показывать в UI: рус. название, иначе англ. */
  displayName: string;
};

export type MatchDTO = {
  id: number;
  utcDate: string; // ISO-строка
  status: MatchStatus;
  minute: number | null;
  stage: string; // GROUP_STAGE | LAST_16 | QUARTER_FINALS | SEMI_FINALS | FINAL | THIRD_PLACE
  group: string | null; // GROUP_A.. | null на плей-офф
  home: TeamDTO;
  away: TeamDTO;
  homeScore: number | null;
  awayScore: number | null;
  isLive: boolean; // status ∈ LIVE_STATUSES
};

export type StandingRowDTO = {
  position: number;
  team: TeamDTO;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type GroupStandingDTO = {
  group: string; // GROUP_A..
  table: StandingRowDTO[];
};

// Ответы API-роутов:
export type LiveResponse = {
  match: MatchDTO | null;
  // чем заменили live, если его нет:
  fallback: "upcoming" | "finished" | null;
};

export type MatchesResponse = {
  date: string; // YYYY-MM-DD (в UTC)
  matches: MatchDTO[];
};

export type StandingsResponse = {
  groups: GroupStandingDTO[];
  playoff: MatchDTO[]; // матчи плей-офф (stage != GROUP_STAGE) для сетки
};

export type RefereeDTO = {
  id: number;
  name: string;
  type: string;
  nationality: string | null;
};

// Доп. детали матча, доступные на free-тарифе (для страницы матча).
export type MatchDetailExtra = {
  matchday: number | null;
  venue: string | null;
  duration: string | null; // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
  halfTimeHome: number | null;
  halfTimeAway: number | null;
  referees: RefereeDTO[];
  lastUpdated: string | null;
};

export type SyncResponse = {
  ok: boolean;
  source: "api" | "skipped";
  counts?: { teams: number; matches: number; standings: number };
  message?: string;
};
