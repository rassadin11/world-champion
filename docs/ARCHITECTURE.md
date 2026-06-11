# ARCHITECTURE

## Стек
- **Next.js (App Router)** + **TypeScript** — фронтенд и бэкенд в одном проекте.
- **Tailwind CSS** — быстрая адаптивная вёрстка, mobile-first.
- **БД:** SQLite через **Prisma** (локально и на старте). При деплое на Vercel —
  миграция на Postgres (Neon/Supabase) тем же Prisma без переписывания кода.
- **Получение данных:** фоновая синхронизация из football-data.org в нашу БД.
- **Деплой:** Vercel.

## Почему «минимальный бэкенд» именно такой
Лимит free-API (10 req/min) не позволяет дёргать внешний API на каждого посетителя.
Решение: **наш сервер периодически тянет данные и кладёт в свою БД**, а все клиенты
читают быстро и без лимитов из нашей БД. Это и есть тот «минимальный бэкенд с БД»,
о котором просил заказчик.

## Поток данных
```
football-data.org  ──(sync, по расписанию)──>  наша БД (Prisma)
                                                   │
                          Next.js API-роуты  <─────┘
                                   │
                       React-компоненты (клиент)
                                   │
                  опрос /api/live раз в 60с (только live-экран)
```

## Слои
```
app/
  page.tsx                 # Главная — «Сейчас в игре»
  today/page.tsx           # Матчи сегодня
  tomorrow/page.tsx        # Матчи завтра
  table/page.tsx           # Таблицы: группы + плей-офф (табы)
  api/
    live/route.ts          # GET — текущий live-матч(и) из БД
    matches/route.ts       # GET ?date=today|tomorrow|YYYY-MM-DD
    standings/route.ts     # GET — таблицы групп
    sync/route.ts          # POST — запуск синхронизации (cron / вручную)
lib/
  providers/
    footballData.ts        # адаптер внешнего API (изолирован)
  sync.ts                  # логика обновления БД из провайдера
  db.ts                    # Prisma client
  teams-ru.ts              # маппинг англ. → рус. названия сборных
components/
  LiveMatch.tsx            # карточка live + фон с флагами
  MatchList.tsx            # список матчей дня
  GroupTable.tsx           # таблица группы
  PlayoffBracket.tsx       # сетка плей-офф
  NavMenu.tsx              # меню (Сегодня / Завтра / Таблица)
prisma/
  schema.prisma
```

## Модель данных (Prisma, черновик)
```prisma
model Team {
  id        Int     @id            // id из football-data.org
  name      String                 // англ. название
  nameRu    String?                // рус. название (из словаря)
  crest     String?                // URL флага
  homeMatches Match[] @relation("home")
  awayMatches Match[] @relation("away")
  standings   Standing[]
}

model Match {
  id         Int      @id          // id из football-data.org
  utcDate    DateTime
  status     String                // SCHEDULED | IN_PLAY | PAUSED | FINISHED | ...
  minute     Int?
  stage      String                // GROUP_STAGE | LAST_16 | ... 
  group      String?               // GROUP_A.. | null для плей-офф
  homeTeam   Team     @relation("home", fields: [homeTeamId], references: [id])
  homeTeamId Int
  awayTeam   Team     @relation("away", fields: [awayTeamId], references: [id])
  awayTeamId Int
  homeScore  Int?
  awayScore  Int?
  updatedAt  DateTime @updatedAt
}

model Standing {
  id           Int    @id @default(autoincrement())
  group        String                // GROUP_A ..
  position     Int
  team         Team   @relation(fields: [teamId], references: [id])
  teamId       Int
  playedGames  Int
  won          Int
  draw         Int
  lost         Int
  goalsFor     Int
  goalsAgainst Int
  goalDifference Int
  points       Int
  @@unique([group, teamId])
}
```

## Стратегия лайв-обновления
- **Синхронизация БД (сервер → внешний API):**
  - Live-матчи: каждые ~60 сек (только когда есть матч в статусе IN_PLAY/PAUSED).
  - Расписание + таблицы: реже, каждые ~30–60 мин.
  - Запускается через Vercel Cron (или ручной POST `/api/sync` в dev).
- **Обновление UI (браузер → наш сервер):**
  - На главном live-экране — `setInterval` / SWR с `refreshInterval: 60000` на `/api/live`.
  - Остальные страницы — обычная подгрузка при заходе (можно ISR-кэш).
- Бережём лимит: внешний API дёргает только сервер, клиенты — только нашу БД.

## Адаптивность
- Mobile-first, breakpoints Tailwind (`sm/md/lg`).
- Меню: на мобиле — нижняя таб-панель или бургер; на десктопе — верхнее меню.
- Live-карточка: на мобиле флаги-фон приглушённые, контент в один столбец;
  на десктопе — шире, флаги по бокам.
- Таблицы: горизонтальный скролл на узких экранах, либо сокращённые колонки.

## Конфигурация
- `.env`: `FOOTBALL_DATA_API_KEY`, `DATABASE_URL`.
- `.env.example` — без секретов, в репозиторий.
