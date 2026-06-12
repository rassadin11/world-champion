// Запись данных провайдера в нашу БД.
import { prisma } from "@/lib/db";
import { ruName } from "@/lib/teams-ru";
import {
  fetchMatches,
  fetchStandings,
  type RawTeam,
} from "@/lib/providers/footballData";

/** Нормализуем имя группы к виду "GROUP_A". null — если группы нет. */
function normalizeGroup(group: string | null | undefined): string | null {
  if (!group) return null;
  const upper = group.trim().toUpperCase().replace(/\s+/g, "_");
  if (!upper) return null;
  return upper.startsWith("GROUP_") ? upper : `GROUP_${upper}`;
}

export async function syncAll(): Promise<{
  teams: number;
  matches: number;
  standings: number;
}> {
  const [matchesRes, standingsRes] = await Promise.all([
    fetchMatches(),
    fetchStandings(),
  ]);

  const matches = matchesRes.matches ?? [];
  const standings = standingsRes.standings ?? [];

  // --- Собираем все команды из матчей и таблиц ---
  const teamsById = new Map<number, RawTeam>();
  for (const m of matches) {
    if (m.homeTeam?.id != null) teamsById.set(m.homeTeam.id, m.homeTeam);
    if (m.awayTeam?.id != null) teamsById.set(m.awayTeam.id, m.awayTeam);
  }
  for (const s of standings) {
    for (const row of s.table ?? []) {
      if (row.team?.id != null) teamsById.set(row.team.id, row.team);
    }
  }

  // --- Upsert команд ---
  let teamsCount = 0;
  for (const team of teamsById.values()) {
    const data = {
      name: team.name,
      nameRu: ruName(team.name),
      crest: team.crest ?? null,
    };
    await prisma.team.upsert({
      where: { id: team.id },
      create: { id: team.id, ...data },
      update: data,
    });
    teamsCount += 1;
  }

  // --- Upsert матчей ---
  let matchesCount = 0;
  for (const m of matches) {
    if (m.homeTeam?.id == null || m.awayTeam?.id == null) continue;
    const apiHome = m.score?.fullTime?.home ?? null;
    const apiAway = m.score?.fullTime?.away ?? null;
    const base = {
      utcDate: new Date(m.utcDate),
      status: m.status,
      minute: m.minute ?? null,
      stage: m.stage,
      group: m.group ?? null,
      homeTeamId: m.homeTeam.id,
      awayTeamId: m.awayTeam.id,
    };
    // Счёт в update пишем только если API его реально отдаёт — иначе не затираем
    // уже сохранённый/восстановленный из таблицы счёт.
    const scoreUpdate =
      apiHome != null && apiAway != null
        ? { homeScore: apiHome, awayScore: apiAway }
        : {};
    await prisma.match.upsert({
      where: { id: m.id },
      create: { id: m.id, ...base, homeScore: apiHome, awayScore: apiAway },
      update: { ...base, ...scoreUpdate },
    });
    matchesCount += 1;
  }

  // --- Upsert таблиц (только групповые) ---
  let standingsCount = 0;
  for (const s of standings) {
    const group = normalizeGroup(s.group);
    if (!group) continue; // пропускаем записи без группы (плей-офф и т.п.)
    for (const row of s.table ?? []) {
      if (row.team?.id == null) continue;
      const goalDifference =
        row.goalDifference ?? row.goalsFor - row.goalsAgainst;
      const data = {
        group,
        position: row.position,
        teamId: row.team.id,
        playedGames: row.playedGames,
        won: row.won,
        draw: row.draw,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference,
        points: row.points,
      };
      await prisma.standing.upsert({
        where: { group_teamId: { group, teamId: row.team.id } },
        create: data,
        update: data,
      });
      standingsCount += 1;
    }
  }

  // --- Восстановление счёта сыгранных матчей из таблиц ---
  // Free-тариф WC не отдаёт счёт по матчу. Но пока команда сыграла ровно 1 матч,
  // её goalsFor/goalsAgainst в таблице = счёт того матча. Этим и пользуемся
  // (с перекрёстной сверкой и без перезаписи уже известного счёта).
  const teamAgg = new Map<number, { played: number; gf: number; ga: number }>();
  for (const s of standings) {
    for (const row of s.table ?? []) {
      if (row.team?.id != null) {
        teamAgg.set(row.team.id, {
          played: row.playedGames,
          gf: row.goalsFor,
          ga: row.goalsAgainst,
        });
      }
    }
  }

  const finishedNoScore = await prisma.match.findMany({
    where: { status: "FINISHED", homeScore: null },
  });
  for (const m of finishedNoScore) {
    const h = teamAgg.get(m.homeTeamId);
    const a = teamAgg.get(m.awayTeamId);
    if (
      h &&
      a &&
      h.played === 1 &&
      a.played === 1 &&
      h.gf === a.ga &&
      h.ga === a.gf
    ) {
      await prisma.match.update({
        where: { id: m.id },
        data: { homeScore: h.gf, awayScore: h.ga },
      });
    }
  }

  return { teams: teamsCount, matches: matchesCount, standings: standingsCount };
}
