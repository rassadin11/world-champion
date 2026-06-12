// Изолированный адаптер для football-data.org v4.
// Здесь и только здесь знаем про их URL, заголовки и формат ответа.

const BASE_URL = "https://api.football-data.org/v4";
const COMPETITION = "WC";

// ---- Минимальные «сырые» типы (только то, что реально читаем) ----

export interface RawTeam {
  id: number;
  name: string;
  crest: string | null;
}

export interface RawMatch {
  id: number;
  utcDate: string;
  status: string;
  minute: number | null;
  stage: string;
  group: string | null;
  homeTeam: RawTeam;
  awayTeam: RawTeam;
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface RawMatchesResponse {
  matches: RawMatch[];
}

export interface RawStandingRow {
  position: number;
  team: RawTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number | null;
  points: number;
}

export interface RawStanding {
  stage: string;
  type: string;
  group: string | null;
  table: RawStandingRow[];
}

export interface RawStandingsResponse {
  standings: RawStanding[];
}

export interface RawReferee {
  id: number;
  name: string;
  type: string;
  nationality: string | null;
}

// Детали одного матча (то, что отдаёт free-тариф сверх списочного ответа).
export interface RawMatchDetail extends RawMatch {
  matchday: number | null;
  venue: string | null;
  lastUpdated: string | null;
  score: {
    duration?: string | null; // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
  referees?: RawReferee[];
}

/** Есть ли непустой ключ API в окружении. */
export function hasApiKey(): boolean {
  return Boolean(process.env.FOOTBALL_DATA_API_KEY?.trim());
}

function headers(): HeadersInit {
  return {
    "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY ?? "",
  };
}

/** GET /competitions/WC/matches — сырой JSON. */
export async function fetchMatches(): Promise<RawMatchesResponse> {
  const res = await fetch(`${BASE_URL}/competitions/${COMPETITION}/matches`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`football-data matches: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as RawMatchesResponse;
}

/** GET /competitions/WC/standings — сырой JSON. */
export async function fetchStandings(): Promise<RawStandingsResponse> {
  const res = await fetch(`${BASE_URL}/competitions/${COMPETITION}/standings`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`football-data standings: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as RawStandingsResponse;
}

/**
 * GET /matches/{id} — детали одного матча (арбитры, тур, тайм-брейк и т.п.).
 * Кэшируем на 5 минут: страница матча редкая, лимит API бережём.
 */
export async function fetchMatchDetail(id: number): Promise<RawMatchDetail> {
  const res = await fetch(`${BASE_URL}/matches/${id}`, {
    headers: headers(),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`football-data match ${id}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as RawMatchDetail;
}
