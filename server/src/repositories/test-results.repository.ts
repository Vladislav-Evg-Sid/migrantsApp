import { pool } from "../db.js";
import { testResultValueFromCode } from "../mappers/test-results.mapper.js";
import type { CreateTestResultInput } from "../types/test-results.js";

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
