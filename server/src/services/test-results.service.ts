import { insertTestResult } from "../repositories/test-results.repository.js";
import { isTestResultCode } from "../mappers/test-results.mapper.js";
import type { CreateTestResultInput } from "../types/test-results.js";

export async function createTestResult(input: CreateTestResultInput): Promise<void> {
  if (input.result !== null && !isTestResultCode(input.result)) {
    const error = new Error("Некорректный код результата экзамена");
    Object.assign(error, { code: "INVALID_TEST_RESULT" });
    throw error;
  }

  await insertTestResult(input);
}
