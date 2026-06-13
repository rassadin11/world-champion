import type { MatchDTO } from "@/lib/types";
import { utcDateKey } from "@/lib/data";
import { MatchCard } from "./MatchList";

// Список матчей за много дней, сгруппированный по дате с заголовком дня.
// Server-safe: без "use client", без хуков. Порядок групп сохраняется из входного
// массива (вперёд для предстоящих, назад для завершённых).

function dayLabel(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function groupByDay(matches: MatchDTO[]): { key: string; matches: MatchDTO[] }[] {
  const groups: { key: string; matches: MatchDTO[] }[] = [];
  for (const match of matches) {
    const key = utcDateKey(new Date(match.utcDate));
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.matches.push(match);
    } else {
      groups.push({ key, matches: [match] });
    }
  }
  return groups;
}

export default function MatchSchedule({
  matches,
  emptyText,
}: {
  matches: MatchDTO[];
  emptyText: string;
}) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-lg text-muted">
        {emptyText}
      </div>
    );
  }

  const groups = groupByDay(matches);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-3 text-lg font-bold capitalize text-muted">
            {dayLabel(group.key)}
          </h2>
          <ul className="flex flex-col gap-3">
            {group.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
