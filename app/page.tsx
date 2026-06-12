import { getLiveMatch } from "@/lib/data";
import LiveMatch from "@/components/LiveMatch";
import PageTransition from "@/components/PageTransition";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getLiveMatch();

  return (
    <PageTransition>
      <LiveMatch initial={initial} />
    </PageTransition>
  );
}
