import type { GroupStandingDTO } from "@/lib/types";
import { groupRu } from "@/lib/stage";

export default function GroupTable({
  group,
  bestThirdIds,
}: {
  group: GroupStandingDTO;
  /** id третьих мест, проходящих как «лучшие третьи» (межгрупповой расчёт). */
  bestThirdIds: Set<number>;
}) {
  return (
    <section className="bg-surface border border-border rounded-2xl overflow-hidden">
      <h3 className="px-5 py-4 text-lg font-extrabold text-foreground border-b border-border">
        {groupRu(group.group)}
      </h3>
      {/* table-fixed + truncate имени => без горизонтального скролла */}
      <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
        <colgroup>
          <col className="w-7" />
          <col />
          <col className="w-7" />
          <col className="w-7" />
          <col className="w-7" />
          <col className="w-7" />
          <col className="w-12" />
          <col className="w-9" />
          <col className="w-9" />
        </colgroup>
        <thead>
          <tr className="text-muted text-[11px] sm:text-xs">
            <th className="px-1.5 py-2.5 text-center font-semibold">#</th>
            <th className="px-1.5 py-2.5 text-left font-semibold">Команда</th>
            <th className="px-1 py-2.5 text-center font-semibold">И</th>
            <th className="px-1 py-2.5 text-center font-semibold">В</th>
            <th className="px-1 py-2.5 text-center font-semibold">Н</th>
            <th className="px-1 py-2.5 text-center font-semibold">П</th>
            <th className="px-1 py-2.5 text-center font-semibold">ГЗ-ГП</th>
            <th className="px-1 py-2.5 text-center font-semibold">РГ</th>
            <th className="px-1 py-2.5 text-center font-semibold">О</th>
          </tr>
        </thead>
        <tbody>
          {group.table.map((row, index) => {
            // Два оттенка зелёного: «direct» — прямой выход (1–2 места),
            // «third» — лучшее третье место (проходит по межгрупповому рейтингу).
            const status: "direct" | "third" | null =
              index < 2
                ? "direct"
                : index === 2 && bestThirdIds.has(row.team.id)
                ? "third"
                : null;
            const rowAccent =
              status === "direct"
                ? "border-l-4 border-l-pitch bg-pitch/10"
                : status === "third"
                ? "border-l-4 border-l-pitch/40 bg-pitch/[0.035]"
                : "";
            return (
              <tr
                key={row.team.id}
                className={`border-t border-border ${rowAccent}`}
              >
                <td className="px-1.5 py-2.5 text-center font-semibold text-muted">
                  {row.position}
                </td>
                <td className="px-1.5 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {row.team.crest ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.team.crest}
                        alt=""
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain shrink-0"
                      />
                    ) : (
                      <span className="w-6 h-6 shrink-0 rounded-md bg-surface-2" />
                    )}
                    <span className="truncate font-semibold text-foreground">
                      {row.team.displayName}
                    </span>
                  </div>
                </td>
                <td className="px-1 py-2.5 text-center text-muted">
                  {row.playedGames}
                </td>
                <td className="px-1 py-2.5 text-center">{row.won}</td>
                <td className="px-1 py-2.5 text-center">{row.draw}</td>
                <td className="px-1 py-2.5 text-center">{row.lost}</td>
                <td className="px-1 py-2.5 text-center whitespace-nowrap text-muted">
                  {row.goalsFor}-{row.goalsAgainst}
                </td>
                <td className="px-1 py-2.5 text-center font-medium">
                  {row.goalDifference > 0
                    ? `+${row.goalDifference}`
                    : row.goalDifference}
                </td>
                <td className="px-1 py-2.5 text-center text-base font-black text-accent sm:text-lg">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
