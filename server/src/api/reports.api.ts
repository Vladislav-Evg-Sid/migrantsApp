import { Router } from "express";
import { getReportDates } from "../repositories/reports.repository.js";
import { generateReport, parseReportOptions, ReportError, type ReportKind } from "../services/reports.service.js";

export const reportsRouter = Router();
reportsRouter.get("/reports/dates", async (_request, response) => response.json(await getReportDates()));
reportsRouter.post("/reports/:kind", async (request, response, next) => {
  try {
    const kind = request.params.kind as ReportKind;
    if (!["analytical", "statistics", "summary"].includes(kind)) throw new ReportError(404, "Отчёт не найден");
    const report = await generateReport(kind, parseReportOptions(request.body, kind));
    response.setHeader("Cache-Control", "no-store");
    response.download(report.path, report.filename, error => {
      void report.cleanup().catch(cleanupError => console.error("Report cleanup:", cleanupError));
      if (error) next(error);
    });
  } catch (error) {
    if (error instanceof ReportError) {
      response.status(error.status).json({ error: "REPORT_ERROR", message: error.message });
    } else next(error);
  }
});
