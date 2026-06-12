// Типы канала React canary: ViewTransition, transitionTypes у <Link> и т.п.
// App Router использует вендоренный React canary, но @types/react по умолчанию
// объявляет только стабильные API. Только типы — в рантайме модуля нет.
/// <reference types="react/canary" />
