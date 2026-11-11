import { pool } from "../db.js";

// One statement gives the generator a consistent snapshot, including future
// registrations used by section 5 of the Word report. IDs stay lossless strings.
export async function getReportSnapshot(): Promise<Record<string, unknown>[]> {
  const result = await pool.query(`
    SELECT r.id::text AS exam_id, p.id::text AS participant_id,
      a.name AS area, p.surname, p.name, p.patronymic,
      to_char(make_date(p.birth_year,p.birth_month,p.birth_day),'YYYY-MM-DD') AS birth_date,
      n.name AS citizenship, ta.name AS multiplicity, r.test_attempt_number AS attempt,
      r.sending_school_code AS school_code, s.name AS school_name, r.class AS grade,
      r.testing_center_ppt_code AS ppt_code, r.is_special_category AS special,
      to_char(make_date(d.year,d.month,d.day),'YYYY-MM-DD') AS test_date,
      r.result::text, ps.name AS status, p.next_planned_date,
      p.confirmed_school_name, p.comment, p.rcoi_note, ppt_school.name AS ppt_name,
      to_char(ap.review_date,'YYYY-MM-DD') AS appeal_date,
      ap.is_granted AS appeal_granted, ap.is_appellant_present AS appeal_present
    FROM test_results r
    JOIN participants p ON p.id=r.participant_id
    JOIN nations n ON n.id=p.nation_id
    JOIN schools s ON s.code=r.sending_school_code
    JOIN areas a ON a.code=s.area_code
    JOIN test_dates d ON d.id=r.test_date_id
    JOIN test_attempts ta ON ta.number=r.test_attempt_number
    JOIN ppts ppt ON ppt.code=r.testing_center_ppt_code
    JOIN schools ppt_school ON ppt_school.code=ppt.school_code
    LEFT JOIN participant_statuses ps ON ps.id=r.status_id
    LEFT JOIN appeals ap ON ap.id=r.appeal_id
    ORDER BY d.year,d.month,d.day,r.id
  `);
  return result.rows;
}

export async function getReportDates() {
  const result = await pool.query<{ date: string; records: number; completed: number }>(`
    SELECT to_char(make_date(d.year,d.month,d.day),'YYYY-MM-DD') AS date,
      count(*)::int AS records,
      count(*) FILTER (WHERE r.result IN ('Зачет','Незачет'))::int AS completed
    FROM test_results r JOIN test_dates d ON d.id=r.test_date_id
    GROUP BY d.year,d.month,d.day ORDER BY d.year,d.month,d.day
  `);
  return result.rows;
}
