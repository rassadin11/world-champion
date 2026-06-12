import type { SyncResponse } from "@/lib/types";
import { syncAll } from "@/lib/sync";
import { hasApiKey } from "@/lib/providers/footballData";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Защита cron-эндпоинта. Vercel Cron автоматически добавляет заголовок
 * `Authorization: Bearer <CRON_SECRET>`, если переменная окружения CRON_SECRET
 * задана. Без секрета (локальная разработка) пускаем всех — чтобы можно было
 * дёрнуть синк вручную через браузер/curl.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function runSync(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return Response.json(
      {
        ok: false,
        source: "skipped",
        message: "Unauthorized — неверный или отсутствующий CRON_SECRET.",
      } satisfies SyncResponse,
      { status: 401 },
    );
  }

  if (!hasApiKey()) {
    return Response.json({
      ok: false,
      source: "skipped",
      message:
        "Нет FOOTBALL_DATA_API_KEY — синк пропущен, используются seed-данные.",
    } satisfies SyncResponse);
  }

  try {
    const counts = await syncAll();
    return Response.json({
      ok: true,
      source: "api",
      counts,
    } satisfies SyncResponse);
  } catch (e) {
    return Response.json(
      {
        ok: false,
        source: "api",
        message: String(e),
      } satisfies SyncResponse,
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return runSync(request);
}

// Vercel Cron вызывает эндпоинт методом GET.
export async function GET(request: Request) {
  return runSync(request);
}
