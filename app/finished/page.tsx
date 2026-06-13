import { getFinishedMatches } from "@/lib/data";
import MatchSchedule from "@/components/MatchSchedule";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function FinishedPage() {
  const matches = await getFinishedMatches();

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 pb-24 sm:pt-10 md:pb-10">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Завершённые матчи
          </h1>
        </header>
        <MatchSchedule matches={matches} emptyText="Завершённых матчей пока нет" />
      </div>
    </PageTransition>
  );
}
