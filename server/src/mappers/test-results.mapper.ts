import type { TestResultCode, TestResultValue } from "../types/test-results.js";

export const TEST_RESULT_OPTIONS = [
  { code: 1, name: "Да" },
  { code: 2, name: "Нет" },
  { code: 3, name: "Неявка" },
] as const satisfies readonly { code: TestResultCode; name: TestResultValue }[];

export const TEST_RESULT_SELECT_OPTIONS = [
  ...TEST_RESULT_OPTIONS,
  { code: null, name: "Не указано" },
] as const;

export function isTestResultCode(value: unknown): value is TestResultCode {
  return TEST_RESULT_OPTIONS.some((option) => option.code === value);
}

export function testResultValueFromCode(code: TestResultCode | null): TestResultValue | null {
  if (code === null) return null;
  return TEST_RESULT_OPTIONS.find((option) => option.code === code)?.name ?? null;
}

export function testResultCodeFromValue(value: TestResultValue): TestResultCode {
  const option = TEST_RESULT_OPTIONS.find((item) => item.name === value);
  if (!option) throw new Error(`Неизвестное значение результата: ${value}`);
  return option.code;
}
