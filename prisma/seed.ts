// Демо-данные ЧМ-2026 для запуска без API-ключа.
// Даты считаются относительно текущего момента, чтобы «Сегодня/Завтра» были наполнены.
import { PrismaClient } from "@prisma/client";
import { ruName } from "../lib/teams-ru";

const prisma = new PrismaClient();

const flag = (iso: string) => `https://flagcdn.com/w320/${iso}.png`;

const TEAMS = [
  { id: 1, name: "United States", iso: "us" },
  { id: 2, name: "Wales", iso: "gb-wls" },
  { id: 3, name: "Senegal", iso: "sn" },
  { id: 4, name: "Iran", iso: "ir" },
  { id: 5, name: "Mexico", iso: "mx" },
  { id: 6, name: "Poland", iso: "pl" },
  { id: 7, name: "Australia", iso: "au" },
  { id: 8, name: "Tunisia", iso: "tn" },
  { id: 9, name: "Argentina", iso: "ar" },
  { id: 10, name: "France", iso: "fr" },
  { id: 11, name: "Brazil", iso: "br" },
  { id: 12, name: "Spain", iso: "es" },
];

function at(offsetMinutes: number): Date {
  return new Date(Date.now() + offsetMinutes * 60_000);
}

async function main() {
  // Команды
  for (const t of TEAMS) {
    await prisma.team.upsert({
      where: { id: t.id },
      update: { name: t.name, nameRu: ruName(t.name), crest: flag(t.iso) },
      create: { id: t.id, name: t.name, nameRu: ruName(t.name), crest: flag(t.iso) },
    });
  }

  // Матчи
  const matches = [
    // LIVE — главный экран
    {
      id: 101, utcDate: at(-67), status: "IN_PLAY", minute: 67,
      stage: "GROUP_STAGE", group: "GROUP_A",
      homeTeamId: 1, awayTeamId: 2, homeScore: 1, awayScore: 0,
    },
    // Завершённый сегодня
    {
      id: 102, utcDate: at(-180), status: "FINISHED", minute: 90,
      stage: "GROUP_STAGE", group: "GROUP_B",
      homeTeamId: 5, awayTeamId: 6, homeScore: 2, awayScore: 1,
    },
    // Ещё сегодня — впереди
    {
      id: 103, utcDate: at(180), status: "TIMED", minute: null,
      stage: "GROUP_STAGE", group: "GROUP_A",
      homeTeamId: 3, awayTeamId: 4, homeScore: null, awayScore: null,
    },
    // Завтра
    {
      id: 104, utcDate: at(60 * 24 + 120), status: "SCHEDULED", minute: null,
      stage: "GROUP_STAGE", group: "GROUP_B",
      homeTeamId: 7, awayTeamId: 8, homeScore: null, awayScore: null,
    },
    {
      id: 105, utcDate: at(60 * 24 + 300), status: "SCHEDULED", minute: null,
      stage: "GROUP_STAGE", group: "GROUP_A",
      homeTeamId: 2, awayTeamId: 3, homeScore: null, awayScore: null,
    },
    // Плей-офф (для сетки)
    {
      id: 201, utcDate: at(60 * 24 * 5), status: "SCHEDULED", minute: null,
      stage: "LAST_16", group: null,
      homeTeamId: 9, awayTeamId: 10, homeScore: null, awayScore: null,
    },
    {
      id: 202, utcDate: at(60 * 24 * 5 + 240), status: "SCHEDULED", minute: null,
      stage: "LAST_16", group: null,
      homeTeamId: 11, awayTeamId: 12, homeScore: null, awayScore: null,
    },
    {
      id: 203, utcDate: at(60 * 24 * 8), status: "SCHEDULED", minute: null,
      stage: "QUARTER_FINALS", group: null,
      homeTeamId: 9, awayTeamId: 11, homeScore: null, awayScore: null,
    },
  ];

  for (const m of matches) {
    await prisma.match.upsert({ where: { id: m.id }, update: m, create: m });
  }

  // Таблицы групп A и B
  const standings = [
    // Группа A
    { group: "GROUP_A", position: 1, teamId: 1, playedGames: 2, won: 2, draw: 0, lost: 0, goalsFor: 4, goalsAgainst: 1, points: 6 },
    { group: "GROUP_A", position: 2, teamId: 3, playedGames: 2, won: 1, draw: 1, lost: 0, goalsFor: 3, goalsAgainst: 2, points: 4 },
    { group: "GROUP_A", position: 3, teamId: 2, playedGames: 2, won: 0, draw: 1, lost: 1, goalsFor: 1, goalsAgainst: 2, points: 1 },
    { group: "GROUP_A", position: 4, teamId: 4, playedGames: 2, won: 0, draw: 0, lost: 2, goalsFor: 0, goalsAgainst: 3, points: 0 },
    // Группа B
    { group: "GROUP_B", position: 1, teamId: 5, playedGames: 2, won: 2, draw: 0, lost: 0, goalsFor: 5, goalsAgainst: 2, points: 6 },
    { group: "GROUP_B", position: 2, teamId: 7, playedGames: 2, won: 1, draw: 0, lost: 1, goalsFor: 3, goalsAgainst: 3, points: 3 },
    { group: "GROUP_B", position: 3, teamId: 8, playedGames: 2, won: 1, draw: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, points: 3 },
    { group: "GROUP_B", position: 4, teamId: 6, playedGames: 2, won: 0, draw: 0, lost: 2, goalsFor: 2, goalsAgainst: 4, points: 0 },
  ];

  for (const s of standings) {
    const goalDifference = s.goalsFor - s.goalsAgainst;
    await prisma.standing.upsert({
      where: { group_teamId: { group: s.group, teamId: s.teamId } },
      update: { ...s, goalDifference },
      create: { ...s, goalDifference },
    });
  }

  console.log(`Seed готов: ${TEAMS.length} команд, ${matches.length} матчей, ${standings.length} строк таблиц.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
