import express, { Router } from "express";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";
import { pool } from "../db.js";
import { ImportError, replaceSummary, type SummaryRow } from "../repositories/imports.repository.js";

async function parseSummary(file: Buffer): Promise<SummaryRow[]> {
  return new Promise((resolve,reject) => {
    const script = fileURLToPath(new URL("../../imports/parse_summary.py",import.meta.url));
    const child = spawn(process.env.REPORT_PYTHON || "python",[script],{
      windowsHide: true, env: { ...process.env,PYTHONUTF8: "1",PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["pipe","pipe","pipe"],
    });
    const chunks: Buffer[] = [];
    let size = 0;
    let limited = false;
    const timer = setTimeout(() => { limited = true; child.kill(); },60_000);
    child.stdout.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 64 * 1024 * 1024) { limited = true; child.kill(); } else chunks.push(chunk);
    });
    child.stderr.resume();
    child.stdin.on("error",() => {});
    child.on("error",() => { clearTimeout(timer); reject(new ImportError(503,"Не удалось запустить обработку файла. Обратитесь к администратору.")); });
    child.on("close",code => {
      clearTimeout(timer);
      if (limited) return reject(new ImportError(400,"Файл слишком большой или обрабатывается слишком долго."));
      try {
        if (code !== 0) throw new Error("Parser failed");
        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { rows: SummaryRow[]; issues: string[] };
        if (parsed.issues.length) reject(new ImportError(400,"Не удалось загрузить сводную",parsed.issues));
        else resolve(parsed.rows);
      } catch { reject(new ImportError(400,"Не удалось прочитать файл. Проверьте формат сводной.")); }
    });
    child.stdin.end(file);
  });
}

export function createImportsRouter(database: Pool = pool) {
  const router = Router();
  let importing = false;
  router.post("/imports/summary",express.raw({ type: ["application/octet-stream","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],limit: "20mb" }),async (request,response,next) => {
    if (request.header("X-Confirm-Replacement") !== "true") {
      response.status(400).json({ message: "Подтвердите замену данных перед загрузкой" });
      return;
    }
    if (!Buffer.isBuffer(request.body) || !request.body.length) {
      response.status(400).json({ message: "Выберите Excel-файл сводной" });
      return;
    }
    if (importing) { response.status(409).json({ message: "Другой импорт ещё выполняется" }); return; }
    importing = true;
    try {
      const rows = await parseSummary(request.body);
      response.json(await replaceSummary(database,rows));
    } catch (error) {
      if (error instanceof ImportError) response.status(error.status).json({ message: error.message,issues: error.issues });
      else if (typeof error === "object" && error && "code" in error && ["55P03","57014","40P01"].includes(String(error.code))) response.status(409).json({ message: "Данные сейчас используются. Повторите загрузку позже." });
      else next(error);
    } finally { importing = false; }
  });
  router.use((error: unknown,_request: express.Request,response: express.Response,next: express.NextFunction) => {
    if (typeof error === "object" && error && "type" in error && error.type === "entity.too.large") response.status(413).json({ message: "Размер файла не должен превышать 20 МБ" });
    else next(error);
  });
  return router;
}

export const importsRouter = createImportsRouter();
