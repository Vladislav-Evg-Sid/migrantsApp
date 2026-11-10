import { spawn } from "node:child_process";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getReportSnapshot } from "../repositories/reports.repository.js";

export type ReportKind = "analytical" | "statistics" | "summary";
export interface ReportOptions {
  startDate: string;
  endDate: string;
  dates: string[];
  recalculate: boolean;
}

export class ReportError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && value >= "1900-01-01" && value <= "9999-12-31"
    && !Number.isNaN(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;
}

export function parseReportOptions(body: unknown, kind: ReportKind): ReportOptions {
  if (!body || typeof body !== "object") throw new ReportError(400, "Не заданы параметры отчёта");
  const { startDate, endDate, dates, recalculate } = body as Record<string, unknown>;
  if (!isDate(startDate) || !isDate(endDate) || startDate > endDate) {
    throw new ReportError(400, "Укажите корректные начало и конец периода");
  }
  if (typeof recalculate !== "boolean") throw new ReportError(400, "Укажите режим пересчёта кратности");
  if (!Array.isArray(dates) || !dates.every(isDate) || dates.length > 1000) {
    throw new ReportError(400, "Некорректный список контрольных дат");
  }
  const selected = [...new Set(dates)].sort();
  if (kind === "statistics" && !selected.length) throw new ReportError(400, "Выберите хотя бы одну дату построения");
  if (selected.some(date => date < startDate || date > endDate)) {
    throw new ReportError(400, "Контрольные даты должны находиться внутри периода");
  }
  return { startDate, endDate, dates: selected, recalculate };
}

const generator = fileURLToPath(new URL("../../reports/generate.py", import.meta.url));
let generating = false;

async function runGenerator(payload: object, output: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.env.REPORT_PYTHON || "python", [generator, output], {
      windowsHide: true, env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["pipe", "ignore", "pipe"],
    });
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, 180_000);
    child.stderr.on("data", chunk => { stderr = (stderr + chunk.toString()).slice(-8000); });
    child.on("error", error => {
      clearTimeout(timer);
      console.error("Report runtime:", error.message);
      reject(new ReportError(503, "Не удалось запустить Python. Установите зависимости из server/reports/requirements.txt и проверьте REPORT_PYTHON."));
    });
    child.stdin.on("error", () => { /* close/error below provides the useful error */ });
    child.on("close", code => {
      clearTimeout(timer);
      if (code === 0) return resolve();
      console.error("Report generator:", stderr);
      reject(new ReportError(timedOut ? 504 : 500, timedOut
        ? "Превышено время построения отчёта. Выберите меньший период."
        : "Не удалось построить отчёт. Подробности записаны в журнал сервера."));
    });
    child.stdin.end(JSON.stringify(payload));
  });
}

export async function generateReport(kind: ReportKind, options: ReportOptions) {
  if (generating) throw new ReportError(409, "Другой отчёт ещё строится. Дождитесь его завершения.");
  generating = true;
  let directory: string | undefined;
  try {
    const rows = await getReportSnapshot();
    const period = rows.filter(row => String(row.test_date) >= options.startDate && String(row.test_date) <= options.endDate
      && (!options.recalculate || kind === "summary" || row.result === "Зачет" || row.result === "Незачет"));
    if (!period.length) throw new ReportError(422, "В выбранном периоде нет данных для отчёта");
    const available = new Set(period.map(row => row.test_date));
    if (options.dates.some(date => !available.has(date))) {
      throw new ReportError(400, "Для одной из выбранных дат нет данных с текущими параметрами");
    }
    const extension = kind === "analytical" ? "docx" : kind === "summary" && options.recalculate ? "zip" : "xlsx";
    const title = { analytical: "Статистико-аналитическая справка", statistics: "Статистика ИГ", summary: "Сводная" }[kind];
    const filename = `${title} ${options.startDate}—${options.endDate}.${extension}`;
    directory = await mkdtemp(join(tmpdir(), "migrants-report-"));
    const path = join(directory, `report.${extension}`);
    await runGenerator({ kind, options, rows }, path);
    if (!(await stat(path)).size) throw new ReportError(500, "Генератор создал пустой файл");
    const cleanupDirectory = directory;
    return { path, filename, cleanup: () => rm(cleanupDirectory, { recursive: true, force: true }) };
  } catch (error) {
    if (directory) await rm(directory, { recursive: true, force: true });
    throw error;
  } finally {
    generating = false;
  }
}
