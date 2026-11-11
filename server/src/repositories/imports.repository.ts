import type { Pool } from "pg";

export interface SummaryRow {
  row: number; id: string; surname: string; name: string; patronymic: string | null;
  birth: string | null; nation: string; attempt: string; school: number; grade: number;
  ppt: number; special: boolean; date: string; result: string | null; status: string | null;
  planned: string | null; confirmedSchool: string | null; comment: string | null;
  note: string | null; appeal: string | null;
}

export class ImportError extends Error {
  constructor(public status: number, message: string, public issues: string[] = []) { super(message); }
}

const normalize = (value: string) => value.toLocaleLowerCase("ru").replaceAll("ё", "е").replace(/[^\p{L}\p{N}]/gu, "");
const append = (value: string | null, extra: string) => value ? `${value}\n${extra}` : extra;

export async function replaceSummary(database: Pool, rows: SummaryRow[]) {
  if (!rows.length) throw new ImportError(400, "В файле нет данных для загрузки");
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '120s'");
    const lock = await client.query("SELECT pg_try_advisory_xact_lock(720026, 1) AS acquired");
    if (!lock.rows[0].acquired) throw new ImportError(409, "Другой импорт ещё выполняется. Дождитесь его завершения.");
    await client.query("LOCK TABLE participants, test_results, appeals, nations, participant_statuses, test_dates IN SHARE ROW EXCLUSIVE MODE");
    const schools = (await client.query<{ code: number; name: string; area_code: number }>("SELECT code,name,area_code FROM schools")).rows;
    const ppts = new Set((await client.query<{ code: number }>("SELECT code FROM ppts")).rows.map(row => row.code));
    const attempts = new Map((await client.query<{ number: number; name: string }>("SELECT number,name FROM test_attempts")).rows.map(row => [normalize(row.name),row.number]));
    const schoolCodes = new Set(schools.map(row => row.code));
    const issues: string[] = [];
    const people = new Map<string, SummaryRow>();
    const sorted = [...rows].sort((a,b) => a.date.localeCompare(b.date) || a.row - b.row);
    for (const row of sorted) {
      if (!schoolCodes.has(row.school)) issues.push(`Строка ${row.row}: школа с кодом ${row.school} не найдена в справочнике`);
      if (!ppts.has(row.ppt)) issues.push(`Строка ${row.row}: ППТ ${row.ppt} не найден в справочнике`);
      if (!attempts.has(normalize(row.attempt))) issues.push(`Строка ${row.row}: неизвестная кратность «${row.attempt}»`);
      const previous = people.get(row.id);
      people.set(row.id, { ...row, birth: row.birth ?? previous?.birth ?? null,
        patronymic: row.patronymic ?? previous?.patronymic ?? null,
        planned: row.planned ?? previous?.planned ?? null,
        confirmedSchool: row.confirmedSchool ?? previous?.confirmedSchool ?? null,
        comment: row.comment ?? previous?.comment ?? null, note: row.note ?? previous?.note ?? null });
    }
    for (const person of people.values()) {
      if (!person.birth) issues.push(`Строка ${person.row}: не заполнена дата рождения участника`);
    }
    if (issues.length) throw new ImportError(400, "Исправьте данные в файле и загрузите его ещё раз", issues.slice(0,30));

    const nations = new Map((await client.query<{ id: number; name: string }>("SELECT id,name FROM nations ORDER BY id")).rows.map(row => [normalize(row.name),row.id]));
    const statuses = new Map((await client.query<{ id: number; name: string }>("SELECT id,name FROM participant_statuses ORDER BY id")).rows.map(row => [normalize(row.name),row.id]));
    const dates = new Map((await client.query<{ id: number; date: string }>("SELECT id,to_char(make_date(year,month,day),'YYYY-MM-DD') AS date FROM test_dates ORDER BY id")).rows.map(row => [row.date,row.id]));
    for (const row of rows) {
      if (!nations.has(normalize(row.nation))) {
        const inserted = await client.query("INSERT INTO nations(name) VALUES($1) RETURNING id",[row.nation]);
        nations.set(normalize(row.nation),inserted.rows[0].id);
      }
      if (row.status && !statuses.has(normalize(row.status))) {
        const inserted = await client.query("INSERT INTO participant_statuses(name) VALUES($1) RETURNING id",[row.status]);
        statuses.set(normalize(row.status),inserted.rows[0].id);
      }
      if (!dates.has(row.date)) {
        const [year,month,day] = row.date.split("-").map(Number);
        const inserted = await client.query("INSERT INTO test_dates(year,month,day) VALUES($1,$2,$3) RETURNING id",[year,month,day]);
        dates.set(row.date,inserted.rows[0].id);
      }
    }

    await client.query("DELETE FROM test_results");
    await client.query("DELETE FROM participants");
    await client.query("DELETE FROM appeals");
    for (const person of people.values()) {
      let confirmed: number | null = null;
      let comment = person.comment;
      if (person.confirmedSchool) {
        const value = person.confirmedSchool;
        const exact = schools.filter(school => normalize(school.name) === normalize(value) || String(school.code) === value);
        confirmed = exact.length === 1 ? exact[0].code : null;
        if (!confirmed) comment = append(comment, `ОО после получения гражданства: ${value}`);
      }
      const [year,month,day] = person.birth!.split("-").map(Number);
      await client.query(`INSERT INTO participants(id,surname,name,patronymic,birth_year,birth_month,birth_day,nation_id,confirmed_school_code,next_planned_date,comment,rcoi_note)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [person.id,person.surname,person.name,person.patronymic,year,month,day,nations.get(normalize(person.nation)),confirmed,person.planned,comment,person.note]);
    }
    for (const row of sorted) {
      let appealId: number | null = null;
      if (row.appeal) {
        const match = row.appeal.match(/^(\d{2})\.(\d{2})\.(\d{2}|\d{4})\s*\/\s*(да|нет|удовлетворена|не удовлетворена|\?)\s*\/\s*(да|нет|в присутствии|без присутствия|\?)$/i);
        if (match) {
          const year = match[3].length === 2 ? `20${match[3]}` : match[3];
          const date = `${year}-${match[2]}-${match[1]}`;
          if (!Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date) {
            const appeal = await client.query("INSERT INTO appeals(review_date,is_granted,is_appellant_present) VALUES($1,$2,$3) RETURNING id",
              [date,match[4] === "?" ? null : ["да","удовлетворена"].includes(match[4].toLowerCase()),match[5] === "?" ? null : ["да","в присутствии"].includes(match[5].toLowerCase())]);
            appealId = appeal.rows[0].id;
          }
        }
        // if (!appealId) await client.query("UPDATE participants SET rcoi_note=concat_ws(E'\\n',rcoi_note,$2::text) WHERE id=$1",[row.id,`Апелляция (${row.date}): ${row.appeal}`]); // TODO: Удалить
      }
      await client.query(`INSERT INTO test_results(participant_id,is_special_category,status_id,test_date_id,result,class,sending_school_code,test_attempt_number,appeal_id,testing_center_ppt_code)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [row.id,row.special,row.status ? statuses.get(normalize(row.status)) : null,dates.get(row.date),row.result,row.grade,row.school,attempts.get(normalize(row.attempt)),appealId,row.ppt]);
    }
    await client.query("COMMIT");
    return { participants: people.size, exams: rows.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
