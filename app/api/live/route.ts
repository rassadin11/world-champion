import { getLiveMatch } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getLiveMatch();
    return Response.json(data);
  } catch {
    return Response.json({ match: null, fallback: null }, { status: 500 });
  }
}
