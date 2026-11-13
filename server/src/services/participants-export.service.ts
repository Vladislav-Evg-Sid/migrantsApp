import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getParticipants } from "./participants.service.js";

const generator = fileURLToPath(new URL("../../reports/participants_export.py", import.meta.url));

export async function exportParticipants(ids: number[]): Promise<Buffer> {
  const table = await getParticipants();
  const byId = new Map(table.body.map(({ row }) => [Number(row[0]), row]));
  const headers = table.head.map(({ cell }) => String(cell));
  const rows = ids.flatMap(id => {
    const row = byId.get(id);
    return row ? [row.map(value => value && typeof value === "object" ? value.name : value)] : [];
  });
  return new Promise<Buffer>((resolve, reject) => {
    const child = spawn(process.env.REPORT_PYTHON || "python", [generator], {
      windowsHide: true,
      env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const chunks: Buffer[] = [];
    let size = 0;
    let stderr = "";
    const timer = setTimeout(() => child.kill(), 120_000);
    child.stdout.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 64 * 1024 * 1024) child.kill();
      else chunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => { stderr = (stderr + chunk.toString()).slice(-4000); });
    child.stdin.on("error", () => {});
    child.on("error", reject);
    child.on("close", code => {
      clearTimeout(timer);
      if (code === 0 && size > 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`Не удалось сформировать таблицу: ${stderr}`));
    });
    child.stdin.end(JSON.stringify({ headers, rows }));
  });
}
