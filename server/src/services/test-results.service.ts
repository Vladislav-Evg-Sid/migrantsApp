import { insertTestResult } from "../repositories/test-results.repository.js";
import type { CreateTestResultInput } from "../types/test-results.js";

export async function createTestResult(input: CreateTestResultInput): Promise<void> {
  await insertTestResult(input);
}
