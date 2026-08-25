import { pool } from "../db.js";
import type { TestResultRow } from "../types/repository/test-results.repository.types.js";

export async function findAllTestResults(): Promise<TestResultRow[]> {
  const result = await pool.query<TestResultRow>(
    `SELECT
       id,
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
     FROM test_results
     ORDER BY id`,
  );

  return result.rows;
}
