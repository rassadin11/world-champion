import { getMatchesByDate } from "@/lib/data";
import MatchList from "@/components/MatchList";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { matches, date } = await getMatchesByDate("today");

  return (
    <PageTransition>
    <div className="mx-auto w-full max-w-4xl px-4 pt-8 pb-24 sm:pt-10 md:pb-10">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Сегодня
        </h1>
        <p className="mt-2 text-base text-muted">{date}</p>
      </header>
      <MatchList matches={matches} />
    </div>
    </PageTransition>
  );
}
