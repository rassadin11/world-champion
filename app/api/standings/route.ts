import { getStandings } from "@/lib/data";
import type { StandingsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  try {
    const payload = await getStandings();
    return Response.json(payload);
  } catch {
    const empty: StandingsResponse = { groups: [], playoff: [] };
    return Response.json(empty, { status: 500 });
  }
}
