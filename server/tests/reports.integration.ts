import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AddressInfo } from "node:net";
import express from "express";
import { pool } from "../src/db.js";
import { reportsRouter } from "../src/api/reports.api.js";
import { parseReportOptions } from "../src/services/reports.service.js";

// Read-only integration check against the real local DB. No fixture insertion.
const output = await mkdtemp(join(process.cwd(), ".report-checks-"));
const app = express();
app.use(express.json());
app.use("/api", reportsRouter);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>(resolve => server.once("listening", resolve));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/reports`;
const expected: object[] = [];
try {
  const rules = spawnSync(process.env.REPORT_PYTHON || "python", ["-X", "utf8", "tests/report_rules.py"], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  assert.equal(rules.status, 0, rules.stdout + rules.stderr);
  const datesResponse = await fetch(`${base}/dates`);
  assert.equal(datesResponse.status, 200);
  const dates = await datesResponse.json() as { date: string }[];
  assert.ok(dates.length > 1, "Need populated database for report comparison");
  const startDate = dates[0].date;
  const endDate = dates.at(-1)!.date;
  const valid = { startDate, endDate, dates: [endDate], recalculate: false };
  for (const body of [
    { ...valid, startDate: "2026-02-30" }, { ...valid, startDate: "9999-12-31" },
    { ...valid, dates: [] }, { ...valid, dates: ["1900-01-01"] }, { ...valid, recalculate: "true" },
  ]) assert.throws(() => parseReportOptions(body, "statistics"));
  for (const [kind, body, status] of [
    ["unknown", valid, 404], ["statistics", { ...valid, dates: [] }, 400],
    ["analytical", { ...valid, startDate: "1900-01-01", endDate: "1900-01-02", dates: [] }, 422],
  ] as const) {
    const response = await fetch(`${base}/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.status, status);
  }
  // Short period tests isolate filtering/recalculation from historic attempts.
  const shortStart = dates[Math.floor(dates.length / 2)].date;
  const controlDates = [dates.at(-2)!.date, endDate];
  for (const [label, first, last, recalculate] of [["all", startDate, endDate, false], ["period", shortStart, endDate, false], ["recalculated", shortStart, endDate, true], ["upcoming", startDate, dates.at(-2)!.date, false]] as const) {
    const options = { startDate: first, endDate: last, dates: controlDates.filter(date => date >= first && date <= last), recalculate };
    const metrics = await pool.query(`
      WITH period AS (
        SELECT r.*, a.name AS area,n.name AS country, ps.name AS status,
          make_date(d.year,d.month,d.day) AS date,
          row_number() OVER (PARTITION BY r.participant_id ORDER BY d.year,d.month,d.day,r.id) AS calculated
        FROM test_results r
        JOIN test_dates d ON d.id=r.test_date_id
        JOIN participants p ON p.id=r.participant_id JOIN nations n ON n.id=p.nation_id
        JOIN schools s ON s.code=r.sending_school_code JOIN areas a ON a.code=s.area_code
        LEFT JOIN participant_statuses ps ON ps.id=r.status_id
        WHERE make_date(d.year,d.month,d.day) BETWEEN $1::date AND $2::date
          AND r.result IN ('Зачет','Незачет')
      ), latest AS (
        SELECT DISTINCT ON(participant_id) * FROM period ORDER BY participant_id,date DESC,id DESC
      ), repeated AS (SELECT * FROM latest WHERE CASE WHEN $3 THEN calculated>1 ELSE test_attempt_number>1 END),
      trajectory AS (SELECT * FROM latest WHERE lower(trim(coalesce(status,''))) != 'сдал')
      SELECT 'attempts' AS category,'' AS label, count(*)::int AS total,
        count(*) FILTER(WHERE result='Зачет')::int AS yes, count(*) FILTER(WHERE result='Незачет')::int AS no FROM period
      UNION ALL SELECT 'children','',count(*)::int,count(*) FILTER(WHERE result='Зачет')::int,count(*) FILTER(WHERE result='Незачет')::int FROM latest
      UNION ALL SELECT 'area',area,count(*)::int,count(*) FILTER(WHERE result='Зачет')::int,count(*) FILTER(WHERE result='Незачет')::int FROM latest GROUP BY area
      UNION ALL SELECT 'grade',class::text,count(*)::int,count(*) FILTER(WHERE result='Зачет')::int,count(*) FILTER(WHERE result='Незачет')::int FROM latest GROUP BY class
      UNION ALL SELECT 'country',country,count(*)::int,count(*) FILTER(WHERE result='Зачет')::int,count(*) FILTER(WHERE result='Незачет')::int FROM latest GROUP BY country
      UNION ALL SELECT 'special','',count(*)::int,count(*) FILTER(WHERE result='Зачет')::int,count(*) FILTER(WHERE result='Незачет')::int FROM latest WHERE is_special_category
      UNION ALL SELECT 'repeat','',count(*)::int,count(*) FILTER(WHERE result='Зачет')::int,count(*) FILTER(WHERE result='Незачет')::int FROM repeated
      UNION ALL SELECT 'trajectory','',count(*)::int,0,0 FROM trajectory
    `, [first, last, recalculate]);
    const summaryCount = await pool.query(`SELECT count(*)::int AS original,count(*) FILTER(WHERE r.result IN ('Зачет','Незачет'))::int AS recalculated
      FROM test_results r JOIN test_dates d ON d.id=r.test_date_id WHERE make_date(d.year,d.month,d.day) BETWEEN $1::date AND $2::date`, [first,last]);
    const daily = await pool.query(`SELECT to_char(make_date(d.year,d.month,d.day),'YYYY-MM-DD') AS date,
      count(*)::int AS total,count(*) FILTER(WHERE r.result='Зачет')::int AS yes,count(*) FILTER(WHERE r.result='Незачет')::int AS no
      FROM test_results r JOIN test_dates d ON d.id=r.test_date_id WHERE make_date(d.year,d.month,d.day)=ANY($1::date[]) AND r.result IN ('Зачет','Незачет') GROUP BY d.year,d.month,d.day`, [options.dates]);
    for (const kind of ["analytical", "statistics", "summary"]) {
      const response = await fetch(`${base}/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...options, dates: kind === "statistics" ? options.dates : [] }) });
      assert.equal(response.status, 200, `${label}/${kind}: ${response.status === 200 ? "" : await response.text()}`);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.match(response.headers.get("content-disposition") || "", /attachment/);
      const extension = kind === "analytical" ? "docx" : kind === "summary" && recalculate ? "zip" : "xlsx";
      const path = join(output, `${label}-${kind}.${extension}`);
      await writeFile(path, Buffer.from(await response.arrayBuffer()));
    }
    const upcoming = await pool.query(`WITH next_date AS (
      SELECT min(make_date(d.year,d.month,d.day)) AS date FROM test_results r JOIN test_dates d ON d.id=r.test_date_id
      WHERE make_date(d.year,d.month,d.day)>$1::date
    ) SELECT count(*)::int AS total FROM test_results r JOIN test_dates d ON d.id=r.test_date_id
      WHERE make_date(d.year,d.month,d.day)=(SELECT date FROM next_date)`, [last]);
    expected.push({ label, options, metrics: metrics.rows, summary: summaryCount.rows[0], daily: daily.rows, upcoming: upcoming.rows[0].total });
  }
  await writeFile(join(output, "expected.json"), JSON.stringify(expected));
  const verification = spawnSync(process.env.REPORT_PYTHON || "python", ["-X", "utf8", "tests/verify_reports.py", output], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  assert.equal(verification.status, 0, verification.stdout + verification.stderr);
  console.log(verification.stdout);
  console.log(`HTTP validation passed; output: ${output}`);
  assert.ok((await readFile(join(output, "all-analytical.docx"))).length > 1000);
} finally {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  await pool.end();
}
