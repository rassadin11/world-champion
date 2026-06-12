"use client";

import { useMemo, useState } from "react";
import type { GroupStandingDTO, MatchDTO } from "@/lib/types";
import { bestThirdTeamIds } from "@/lib/qualification";
import GroupTable from "@/components/GroupTable";
import PlayoffBracket from "@/components/PlayoffBracket";

type Tab = "groups" | "playoff";

type Props = {
  groups: GroupStandingDTO[];
  playoff: MatchDTO[];
};

export default function StandingsTabs({ groups, playoff }: Props) {
  const [tab, setTab] = useState<Tab>("groups");

  // Межгрупповой расчёт «лучших третьих мест» (формат ЧМ-2026: 8 третьих проходят).
  const bestThirdIds = useMemo(() => bestThirdTeamIds(groups), [groups]);

  const tabClass = (active: boolean) =>
    `px-6 py-3 rounded-xl text-base font-bold transition-colors ${
      active
        ? "bg-surface-2 text-accent shadow-inner"
        : "text-muted hover:text-foreground hover:bg-surface-2/50"
    }`;

  return (
    <div>
      <div className="flex gap-3 mb-8">
        <button
          type="button"
          onClick={() => setTab("groups")}
          className={tabClass(tab === "groups")}
          aria-pressed={tab === "groups"}
        >
          Группы
        </button>
        <button
          type="button"
          onClick={() => setTab("playoff")}
          className={tabClass(tab === "playoff")}
          aria-pressed={tab === "playoff"}
        >
          Плей-офф
        </button>
      </div>

      {tab === "groups" ? (
        groups.length === 0 ? (
          <p className="text-base text-muted">Данных по группам пока нет.</p>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-pitch" />
                Выходят напрямую (1–2 места)
              </span>
              {bestThirdIds.size > 0 && (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-pitch/40" />
                  Лучшие третьи места
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {groups.map((g) => (
                <GroupTable key={g.group} group={g} bestThirdIds={bestThirdIds} />
              ))}
            </div>
          </>
        )
      ) : (
        <PlayoffBracket matches={playoff} />
      )}
    </div>
  );
}
