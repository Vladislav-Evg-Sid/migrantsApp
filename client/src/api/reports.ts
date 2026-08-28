import { type ReportPreview } from "../types/reports";

export async function getReports(): Promise<ReportPreview[]> {
  return [
    {
      id: 1,
      type: "text",
      name: "Статистико-аналитическая справка",
    },
    {
      id: 2,
      type: "table",
      name: "Статистика ИГ",
    },
    {
      id: 3,
      type: "table",
      name: "Сводная",
    },
    {
      id: 4,
      type: "table",
      name: "Траектория",
    },
  ];
}
