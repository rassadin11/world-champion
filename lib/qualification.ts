// Логика выхода из групп для ЧМ-2026.
// 12 групп → напрямую проходят по 2 команды (24), плюс 8 ЛУЧШИХ третьих мест = 32.
// Подсветка в таблице делается в два оттенка: «напрямую» и «лучший третий».
import type { GroupStandingDTO } from "./types";

/** Ближайшая степень двойки, не меньшая n. */
function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Сколько команд с 3-х мест добирается в плей-офф при данном числе групп.
 * Поле добивается до ближайшей степени двойки от числа напрямую выходящих (2 × группы):
 *   12 групп → 24 → до 32 → 8 третьих (формат ЧМ-2026);
 *    6 групп → 12 → до 16 → 4 третьих (формат Евро);
 *    8 групп → 16 → 0 третьих (классические 32 команды);
 *    2 группы (seed) → 4 → 0 третьих.
 */
export function bestThirdsCount(groupCount: number): number {
  const direct = groupCount * 2;
  return Math.max(0, nextPowerOfTwo(direct) - direct);
}

/**
 * Множество id команд, занимающих 3-е место и проходящих как «лучшие третьи».
 * Третьи места ранжируются по очкам → разнице мячей → забитым (критерии ФИФА).
 * В расчёт идут только сыгравшие команды, чтобы до старта турнира ничего не подсвечивалось.
 */
export function bestThirdTeamIds(groups: GroupStandingDTO[]): Set<number> {
  const need = bestThirdsCount(groups.length);
  if (need <= 0) return new Set();

  const thirds = groups
    .map((g) => g.table[2]) // table отсортирован по позиции → 3-я строка
    .filter((row) => Boolean(row) && row.playedGames > 0);

  thirds.sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor
  );

  return new Set(thirds.slice(0, need).map((r) => r.team.id));
}
