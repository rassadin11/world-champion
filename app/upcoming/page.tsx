import { getUpcomingMatches } from "@/lib/data";
import MatchSchedule from "@/components/MatchSchedule";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function UpcomingPage() {
  const matches = await getUpcomingMatches();

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 pb-24 sm:pt-10 md:pb-10">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Предстоящие матчи
          </h1>
        </header>
        <MatchSchedule matches={matches} emptyText="Предстоящих матчей пока нет" />
      </div>
    </PageTransition>
  );
}
