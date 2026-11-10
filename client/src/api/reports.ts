import { baseApi } from "../env";
import type { ReportDate, ReportKind, ReportOptions, ReportPreview } from "../types/reports";

export async function getReports(): Promise<ReportPreview[]> {
  return [
    {
      id: 1,
      type: "text",
      name: "Статистико-аналитическая справка",
      slug: "analytical",
    },
    {
      id: 2,
      type: "table",
      name: "Статистика ИГ",
      slug: "statistics",
    },
    {
      id: 3,
      type: "table",
      name: "Сводная",
      slug: "summary",
    },
  ];
}

async function checkResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Не удалось получить отчёт. Проверьте подключение к серверу.");
  }
}

export async function getReportDates(signal?: AbortSignal): Promise<ReportDate[]> {
  const response = await fetch(`${baseApi}/reports/dates`, { signal: signal ?? null });
  await checkResponse(response);
  return response.json();
}

export async function downloadReport(kind: ReportKind, options: ReportOptions) {
  const response = await fetch(`${baseApi}/reports/${kind}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(options),
  });
  await checkResponse(response);
  const blob = await response.blob();
  const extension = kind === "analytical" ? "docx" : kind === "summary" && options.recalculate ? "zip" : "xlsx";
  const encodedName = response.headers.get("Content-Disposition")?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const name = encodedName ? decodeURIComponent(encodedName) : `Отчёт ${options.startDate}—${options.endDate}.${extension}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
