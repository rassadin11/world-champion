// Преобразование Prisma-моделей в нормализованные DTO (lib/types).
// Используется во всех API-роутах — единая точка сериализации, чтобы формат был одинаков.
import type { Match, Team } from "@prisma/client";
import { LIVE_STATUSES, type MatchDTO, type MatchStatus, type TeamDTO } from "./types";

export function toTeamDTO(team: Team): TeamDTO {
  return {
    id: team.id,
    name: team.name,
    nameRu: team.nameRu ?? null,
    crest: team.crest ?? null,
    displayName: team.nameRu ?? team.name,
  };
}

type MatchWithTeams = Match & { homeTeam: Team; awayTeam: Team };

export function toMatchDTO(match: MatchWithTeams): MatchDTO {
  const status = match.status as MatchStatus;
  return {
    id: match.id,
    utcDate: match.utcDate.toISOString(),
    status,
    minute: match.minute ?? null,
    stage: match.stage,
    group: match.group ?? null,
    home: toTeamDTO(match.homeTeam),
    away: toTeamDTO(match.awayTeam),
    homeScore: match.homeScore ?? null,
    awayScore: match.awayScore ?? null,
    isLive: LIVE_STATUSES.includes(status),
  };
}

// include-объект для запросов Match с командами (общий для всех роутов).
export const matchInclude = { homeTeam: true, awayTeam: true } as const;
