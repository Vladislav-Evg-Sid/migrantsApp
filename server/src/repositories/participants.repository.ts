import { pool } from "../db.js";
import type {
  ParticipantDetailsRow,
  ParticipantExamRow,
  ParticipantListRow,
} from "../types/repository/participants.repository.types.js";

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

export async function findParticipantExams(id: number): Promise<ParticipantExamRow[]> {
  const result = await pool.query<ParticipantExamRow>(
    `SELECT
       tr.id,
       tr.test_attempt_number,
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
