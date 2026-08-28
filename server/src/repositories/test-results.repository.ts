import { pool } from "../db.js";
import { testResultValueFromCode } from "../mappers/test-results.mapper.js";
import type {
  CreateTestResultInput,
  UpdateTestResultInput,
} from "../types/test-results.js";
import type { TestResultPptRow } from "../types/repository/test-results.repository.types.js";

export async function testDateExistsById(id: number): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM test_dates WHERE id = $1) AS exists",
    [id],
  );

  return result.rows[0].exists;
}

export async function findAllPptsWithParticipantCountByTestDateId(
  testDateId: number,
): Promise<TestResultPptRow[]> {
  const result = await pool.query<TestResultPptRow>(
    `SELECT
       ppt.code AS ppt_code,
       school.name AS ppt_name,
       area.code AS area_code,
       area.name AS area_name,
       school.code AS school_code,
       COUNT(DISTINCT tr.participant_id)::INTEGER AS participant_count
     FROM ppts ppt
     JOIN schools school ON school.code = ppt.school_code
     JOIN areas area ON area.code = school.area_code
     LEFT JOIN test_results tr
       ON tr.testing_center_ppt_code = ppt.code
      AND tr.test_date_id = $1
     GROUP BY ppt.code, school.name, area.code, area.name, school.code
     ORDER BY ppt.code`,
    [testDateId],
  );

  return result.rows;
}

export async function insertTestResult(input: CreateTestResultInput): Promise<void> {
  await pool.query(
    `INSERT INTO test_results (
       participant_id,
       is_special_category,
       status_id,
       test_date_id,
       result,
       class,
       sending_school_code,
       test_attempt_number,
       appeal_id,
       testing_center_ppt_code
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      input.participantId,
      input.isSpecialCategory,
      input.statusId,
      input.testDateId,
      testResultValueFromCode(input.result),
      input.class,
      input.sendingSchoolCode,
      input.testAttemptNumber,
      input.appealId,
      input.testingCenterPptCode,
    ],
  );
}

export async function updateTestResultById(
  id: number,
  input: UpdateTestResultInput,
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE test_results
     SET participant_id = $1,
         is_special_category = $2,
         status_id = $3,
         test_date_id = $4,
         result = $5,
         class = $6,
         sending_school_code = $7,
         test_attempt_number = $8,
         appeal_id = $9,
         testing_center_ppt_code = $10
     WHERE id = $11`,
    [
      input.participantId,
      input.isSpecialCategory,
      input.statusId,
      input.testDateId,
      testResultValueFromCode(input.result),
      input.class,
      input.sendingSchoolCode,
      input.testAttemptNumber,
      input.appealId,
      input.testingCenterPptCode,
      id,
    ],
  );

  return result.rowCount === 1;
}

export async function deleteTestResultById(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM test_results WHERE id = $1", [id]);
  return result.rowCount === 1;
}
