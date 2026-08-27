import { pool } from "../db.js";
import { testResultValueFromCode } from "../mappers/test-results.mapper.js";
import type {
  CreateTestResultInput,
  UpdateTestResultInput,
} from "../types/test-results.js";

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
