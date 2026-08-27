import { pool } from "../db.js";
import type {
  ParticipantDetailsRow,
  ParticipantExamRow,
  ParticipantListRow,
} from "../types/repository/participants.repository.types.js";
import type {
  CreateParticipantInput,
  CreatedParticipant,
  UpdateParticipantInput,
} from "../types/participants.js";
import { testResultValueFromCode } from "../mappers/test-results.mapper.js";

export async function insertParticipantWithFirstExam(
  input: CreateParticipantInput,
): Promise<CreatedParticipant> {
  const client = await pool.connect();
  const pptPart = String(input.firstExam.testingCenterPptCode).padStart(4, "0");
  const classPart = String(input.firstExam.class).padStart(2, "0");
  const participantPrefix = Number(`72${pptPart}${classPart}`);
  const firstParticipantId = participantPrefix * 100 + 1;
  const lastParticipantId = participantPrefix * 100 + 99;

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [participantPrefix]);

    const sequenceResult = await client.query<{ next_number: number }>(
      `SELECT COALESCE(MAX((id % 100)::INTEGER), 0) + 1 AS next_number
       FROM participants
       WHERE id BETWEEN $1 AND $2`,
      [firstParticipantId, lastParticipantId],
    );
    const nextNumber = Number(sequenceResult.rows[0].next_number);
    if (nextNumber > 99) {
      const error = new Error("Для сочетания ППТ и класса закончились номера участников");
      Object.assign(error, { code: "PARTICIPANT_SEQUENCE_EXHAUSTED" });
      throw error;
    }

    const participantId = participantPrefix * 100 + nextNumber;
    await client.query(
      `INSERT INTO participants (
         id, surname, name, patronymic, birth_day, birth_month, birth_year,
         nation_id, confirmed_school_code, next_planned_date, comment, rcoi_note
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        participantId,
        input.surname,
        input.name,
        input.patronymic,
        input.birthDay,
        input.birthMonth,
        input.birthYear,
        input.nationId,
        input.confirmedSchoolCode,
        input.nextPlannedDate,
        input.comment,
        input.rcoiNote,
      ],
    );

    const exam = input.firstExam;
    await client.query(
      `INSERT INTO test_results (
         participant_id, is_special_category, status_id, test_date_id, result,
         class, sending_school_code, test_attempt_number, appeal_id,
         testing_center_ppt_code
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        participantId,
        exam.isSpecialCategory,
        exam.statusId,
        exam.testDateId,
        testResultValueFromCode(exam.result),
        exam.class,
        exam.sendingSchoolCode,
        exam.testAttemptNumber,
        exam.appealId,
        exam.testingCenterPptCode,
      ],
    );

    await client.query("COMMIT");
    return { id: participantId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findParticipantsForTable(): Promise<ParticipantListRow[]> {
  const result = await pool.query<ParticipantListRow>(
    `SELECT
       p.id,
       p.surname,
       p.name,
       p.patronymic,
       p.birth_day,
       p.birth_month,
       p.birth_year,
       p.nation_id,
       p.confirmed_school_code,
       p.next_planned_date,
       p.comment,
       p.rcoi_note,
       n.name AS nation_name
     FROM participants p
     JOIN nations n ON n.id = p.nation_id
     ORDER BY p.id`,
  );

  return result.rows;
}

export async function findParticipantById(id: number): Promise<ParticipantDetailsRow | null> {
  const result = await pool.query<ParticipantDetailsRow>(
    `SELECT
       p.id,
       p.surname,
       p.name,
       p.patronymic,
       p.birth_day,
       p.birth_month,
       p.birth_year,
       p.nation_id,
       p.confirmed_school_code,
       p.next_planned_date,
       p.comment,
       p.rcoi_note,
       n.name AS nation_name,
       s.name AS confirmed_school_name
     FROM participants p
     JOIN nations n ON n.id = p.nation_id
     LEFT JOIN schools s ON s.code = p.confirmed_school_code
     WHERE p.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function participantExistsById(id: number): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM participants WHERE id = $1) AS exists",
    [id],
  );

  return result.rows[0].exists;
}

export async function updateParticipantById(
  id: number,
  input: UpdateParticipantInput,
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE participants
     SET surname = $1,
         name = $2,
         patronymic = $3,
         birth_day = $4,
         birth_month = $5,
         birth_year = $6,
         nation_id = $7,
         confirmed_school_code = $8,
         next_planned_date = $9,
         comment = $10,
         rcoi_note = $11
     WHERE id = $12`,
    [
      input.surname,
      input.name,
      input.patronymic,
      input.birthDay,
      input.birthMonth,
      input.birthYear,
      input.nationId,
      input.confirmedSchoolCode,
      input.nextPlannedDate,
      input.comment,
      input.rcoiNote,
      id,
    ],
  );

  return result.rowCount === 1;
}

export async function deleteParticipantById(id: number): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM test_results WHERE participant_id = $1", [id]);
    const result = await client.query("DELETE FROM participants WHERE id = $1", [id]);
    await client.query("COMMIT");
    return result.rowCount === 1;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findParticipantExams(id: number): Promise<ParticipantExamRow[]> {
  const result = await pool.query<ParticipantExamRow>(
    `SELECT
       tr.id,
       tr.test_attempt_number,
       tr.test_date_id,
       td.day AS test_day,
       td.month AS test_month,
       td.year AS test_year,
       tr.sending_school_code,
       sending_school.name AS sending_school_name,
       tr.testing_center_ppt_code,
       testing_center_school.name AS testing_center_name,
       tr.class,
       tr.result,
       tr.status_id,
       ps.name AS status_name,
       tr.is_special_category,
       a.review_date::text AS appeal_review_date,
       a.is_granted AS appeal_is_granted,
       a.is_appellant_present AS appeal_is_appellant_present
     FROM test_results tr
     JOIN test_dates td ON td.id = tr.test_date_id
     JOIN schools sending_school ON sending_school.code = tr.sending_school_code
     JOIN ppts ppt ON ppt.code = tr.testing_center_ppt_code
     JOIN schools testing_center_school ON testing_center_school.code = ppt.school_code
     LEFT JOIN participant_statuses ps ON ps.id = tr.status_id
     LEFT JOIN appeals a ON a.id = tr.appeal_id
     WHERE tr.participant_id = $1
     ORDER BY td.year, td.month, td.day, tr.id`,
    [id],
  );

  return result.rows;
}
