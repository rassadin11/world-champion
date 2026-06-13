// Время и даты матчей показываем по Москве (МСК) — единообразно и на сервере,
// и в браузере, независимо от часового пояса рантайма. Иначе серверные страницы
// рендерят время в UTC, а клиентские — в локальном поясе пользователя.
export const MATCH_TZ = "Europe/Moscow";

/** Ключ дня (YYYY-MM-DD) в МСК — для группировки матчей по дням. */
export function moscowDayKey(iso: string): string {
  // en-CA даёт формат YYYY-MM-DD.
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: MATCH_TZ });
}
