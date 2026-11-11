import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { AddressInfo } from "node:net";
import express from "express";
import pg from "pg";
import { pool } from "../src/db.js";
import { createImportsRouter } from "../src/api/imports.api.js";

const productionUrl = new URL(process.env.DATABASE_URL!);
const databaseName = `migrants_import_test_${Date.now()}`;
assert.match(databaseName,/^migrants_import_test_\d+$/);
const tables = ["participants","test_results","appeals","schools","ppts","areas","area_responsibles","nations","participant_statuses","test_dates","test_attempts"];
async function fingerprint(database: pg.Pool) {
  const values = [];
  for (const table of tables) {
    const result = await database.query(`SELECT count(*)::int AS count,md5(coalesce(string_agg(value::text,E'\n' ORDER BY value::text),'')) AS hash FROM (SELECT to_jsonb(t) AS value FROM ${table} t) q`);
    values.push(result.rows[0]);
  }
  return values;
}

const before = await fingerprint(pool);
await pool.query(`CREATE DATABASE "${databaseName}"`);
const testUrl = new URL(productionUrl);
testUrl.pathname = `/${databaseName}`;
const database = new pg.Pool({ connectionString: testUrl.toString() });
assert.notEqual(testUrl.pathname,productionUrl.pathname);
const app = express();
app.use("/api",createImportsRouter(database));
app.use((error: unknown,_request: express.Request,response: express.Response,_next: express.NextFunction) => response.status(500).json({ message: String(error) }));
const server = app.listen(0,"127.0.0.1");
await new Promise<void>(resolve => server.once("listening",resolve));
const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/imports/summary`;
let assertions = 0;

function workbook(rows: unknown[][], badHeaders = false) {
  const script = `import sys,json,io
from datetime import date
from pathlib import Path
from openpyxl import Workbook
data=json.load(sys.stdin)
w=Workbook(); s=w.active
headers=json.loads(Path('reports/source-layout.json').read_text(encoding='utf-8'))['headers']
if data['badHeaders']: headers[0]='Wrong header'
s.append(headers)
for row in data['rows']:
 for col in (7,14):
  if isinstance(row[col],str) and row[col]: row[col]=date.fromisoformat(row[col])
 s.append(row)
buf=io.BytesIO(); w.save(buf); sys.stdout.buffer.write(buf.getvalue())`;
  const result = spawnSync(process.env.REPORT_PYTHON || "python",["-X","utf8","-c",script],{ input: JSON.stringify({ rows,badHeaders }),maxBuffer: 5*1024*1024 });
  assert.equal(result.status,0,result.stderr.toString());
  return result.stdout;
}
async function post(data: Buffer, confirmed=true) {
  return fetch(endpoint,{ method: "POST",headers: { "Content-Type": "application/octet-stream",...(confirmed ? { "X-Confirm-Replacement": "true" } : {}) },body: new Uint8Array(data) });
}

try {
  await database.query(await readFile("../database/schema.sql","utf8"));
  await database.query(await readFile("../database/reference_data.sql","utf8"));
  const school = (await database.query("SELECT code FROM schools ORDER BY code LIMIT 1")).rows[0].code;
  const ppt = (await database.query("SELECT code FROM ppts ORDER BY code LIMIT 1")).rows[0].code;
  const nation = (await database.query("SELECT name FROM nations ORDER BY id LIMIT 1")).rows[0].name;
  const template = [1,99000001,99000001,"Тест","Импорт","Проверка",null,"2015-01-01",nation,"первый",school,1,ppt,"нет","2026-01-01","нет","Тестовый статус",null,"Свободный текст школы","Комментарий",null,"ППТ","01.02.2026/нет/да","Школа"];
  const second = [...template]; second[0]=2; second[9]="второй"; second[14]="2026-02-01"; second[15]="да";
  const third = [...template]; third[0]=3; third[1]=99000002; third[2]=99000002; third[15]="неявка"; third[22]="неоднозначная апелляция";
  let response = await post(workbook([template,second,third]));
  assert.equal(response.status,200,await response.clone().text());
  assert.deepEqual(await response.json(),{ participants: 2,exams: 3 }); assertions+=2;
  assert.equal((await database.query("SELECT count(*)::int AS n FROM test_results")).rows[0].n,3);
  assert.equal((await database.query("SELECT surname FROM participants WHERE id=99000001")).rows[0].surname,"Импорт");
  assert.equal((await database.query("SELECT result FROM test_results WHERE participant_id=99000001 ORDER BY id DESC LIMIT 1")).rows[0].result,"Зачет");
  assert.equal((await database.query("SELECT count(*)::int AS n FROM appeals")).rows[0].n,2);
  assert.match((await database.query("SELECT comment FROM participants WHERE id=99000001")).rows[0].comment,/Свободный текст школы/);
  assert.match((await database.query("SELECT rcoi_note FROM participants WHERE id=99000002")).rows[0].rcoi_note,/неоднозначная апелляция/); assertions+=6;
  const saved = await fingerprint(database);
  const invalidSchool = [...template]; invalidSchool[10]=999999999;
  const missingBirth = [...template]; missingBirth[7]=null;
  const badResult = [...template]; badResult[15]="ошибка";
  const negative = [
    [Buffer.from("not an xlsx"),true], [workbook([template],true),true],
    [workbook([]),true], [workbook([template]),false],
    [workbook([invalidSchool]),true], [workbook([missingBirth]),true],
    [workbook([template,badResult]),true],
  ] as const;
  for (const [data,confirmed] of negative) {
    response = await post(data,confirmed);
    assert.equal(response.status,400,await response.clone().text());
    assert.deepEqual(await fingerprint(database),saved,"Failed import changed existing data"); assertions+=2;
  }
  response = await post(Buffer.alloc(21*1024*1024));
  assert.equal(response.status,413);
  assert.deepEqual(await fingerprint(database),saved); assertions+=2;

  // Force a failure after DELETE to verify atomic rollback of the replacement.
  await database.query(`CREATE FUNCTION fail_import() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test rollback'; END $$;
    CREATE TRIGGER fail_import BEFORE INSERT ON test_results FOR EACH ROW EXECUTE FUNCTION fail_import()`);
  response = await post(workbook([third]));
  assert.equal(response.status,500);
  assert.deepEqual(await fingerprint(database),saved,"Rollback failed after replacement started"); assertions+=2;
  await database.query("DROP TRIGGER fail_import ON test_results; DROP FUNCTION fail_import()");

  response = await post(workbook([third]));
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ participants: 1,exams: 1 });
  assert.equal((await database.query("SELECT count(*)::int AS n FROM appeals")).rows[0].n,0);
  assert.equal((await database.query("SELECT count(*)::int AS n FROM participants WHERE id=99000001")).rows[0].n,0); assertions+=4;

  // Check the supplied real workbook only in this disposable test database.
  if (process.env.IMPORT_SAMPLE) {
    const sample = await readFile(process.env.IMPORT_SAMPLE);
    const savedSample = await fingerprint(database);
    response = await post(sample);
    let body = await response.json();
    if (response.status === 400) {
      assert.deepEqual(body.issues,["Строка 543: не заполнена дата рождения участника","Строка 616: не заполнена дата рождения участника"]);
      assert.deepEqual(await fingerprint(database),savedSample);
      console.log("Original sample correctly rejected: missing birth dates in rows 543 and 616.");
      // Repair only an in-memory disposable test copy. Never modify the source.
      const script = `import io,sys,warnings
from datetime import date
from openpyxl import load_workbook,Workbook
warnings.filterwarnings('ignore',category=UserWarning)
old=load_workbook(io.BytesIO(sys.stdin.buffer.read()),read_only=True,data_only=True)
new=Workbook(write_only=True); s=new.create_sheet()
for i,row in enumerate(old.worksheets[0].iter_rows(values_only=True)):
 row=list(row)
 if i and row[1] and row[14] and row[7] is None: row[7]=date(2010,1,1)
 s.append(row)
buf=io.BytesIO(); new.save(buf); old.close(); sys.stdout.buffer.write(buf.getvalue())`;
      const repaired = spawnSync(process.env.REPORT_PYTHON || "python",["-X","utf8","-c",script],{ input: sample,maxBuffer: 20*1024*1024 });
      assert.equal(repaired.status,0,repaired.stderr.toString());
      response = await post(repaired.stdout);
      body = await response.json(); assertions+=3;
    }
    console.log("Disposable sample copy import:",JSON.stringify(body));
    assert.equal(response.status,200,JSON.stringify(body));
    assert.deepEqual(body,{ participants: 810,exams: 1148 }); assertions+=2;
  }
  assert.deepEqual(await fingerprint(pool),before,"Current database changed during testing"); assertions++;
  console.log(`Passed ${assertions} import assertions; current database fingerprint unchanged.`);
} finally {
  await new Promise<void>(resolve => server.close(() => resolve()));
  await database.end();
  await pool.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
  await pool.end();
}
