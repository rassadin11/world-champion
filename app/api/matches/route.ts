import { getMatchesByDate } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const date = new URL(request.url).searchParams.get("date");
    const payload = await getMatchesByDate(date);
    return Response.json(payload);
  } catch {
    return Response.json({ date: "", matches: [] }, { status: 500 });
  }
}
