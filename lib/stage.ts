// Человекочитаемые рус. подписи стадий и групп + порядок для сетки плей-офф.

export const STAGE_RU: Record<string, string> = {
  GROUP_STAGE: "Групповой этап",
  LAST_32: "1/16 финала",
  ROUND_OF_32: "1/16 финала",
  LAST_16: "1/8 финала",
  ROUND_OF_16: "1/8 финала",
  QUARTER_FINALS: "1/4 финала",
  QUARTER_FINAL: "1/4 финала",
  SEMI_FINALS: "1/2 финала",
  SEMI_FINAL: "1/2 финала",
  THIRD_PLACE: "Матч за 3-е место",
  FINAL: "Финал",
};

// Порядок стадий плей-офф (раннее → позднее) для построения сетки.
export const PLAYOFF_ORDER = [
  "LAST_32",
  "ROUND_OF_32",
  "LAST_16",
  "ROUND_OF_16",
  "QUARTER_FINALS",
  "QUARTER_FINAL",
  "SEMI_FINALS",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

export function stageRu(stage: string): string {
  return STAGE_RU[stage] ?? stage;
}

/** "GROUP_A" → "A" */
export function groupLetter(group: string): string {
  return group.replace(/^GROUP_/, "");
}

/** "GROUP_A" → "Группа A" */
export function groupRu(group: string): string {
  return `Группа ${groupLetter(group)}`;
}
