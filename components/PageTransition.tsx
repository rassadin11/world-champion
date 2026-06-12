import { ViewTransition } from "react";

// Обёртка контента страницы: анимация зависит от типа навигации,
// который проставляют ссылки через transitionTypes (см. NavMenu, MatchList).
// Без типа (первая загрузка, кнопка «назад» браузера) — без анимации.
const TYPES = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  "nav-tab": "nav-tab",
  default: "none",
};

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition enter={TYPES} exit={TYPES} default="none">
      {children}
    </ViewTransition>
  );
}
