import { findAllTestResults } from "../repositories/test-results.repository.js";
import type { TestResultRow } from "../types/repository/test-results.repository.types.js";

export async function getTestResults(): Promise<TestResultRow[]> {
  return findAllTestResults();
}
