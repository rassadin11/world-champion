import { getStandings } from "@/lib/data";
import StandingsTabs from "@/components/StandingsTabs";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function TablePage() {
  const { groups, playoff } = await getStandings();

  return (
    <PageTransition>
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 pb-24 sm:pt-10 md:pb-10">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Турнирная таблица
        </h1>
      </header>
      <StandingsTabs groups={groups} playoff={playoff} />
    </section>
    </PageTransition>
  );
}
