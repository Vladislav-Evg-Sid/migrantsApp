import { insertTestResult } from "../repositories/test-results.repository.js";
import {
  isTestResultCode,
  TEST_RESULT_SELECT_OPTIONS,
} from "../mappers/test-results.mapper.js";
import {
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
  findAllTestAttempts,
  findAllTestDates,
} from "../repositories/reference-data.repository.js";
import type { SelectOption, TableHeadCell } from "../types/reference-data.js";
import type { CreateTestResultInput } from "../types/test-results.js";

function formatDate(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

function nullableOptions(options: SelectOption[]): SelectOption[] {
  return [...options, { code: null, name: "Не указано" }];
}

export async function getTestResultCreationHead(): Promise<TableHeadCell[]> {
  const [statuses, testDates, schools, attempts, ppts] = await Promise.all([
    findAllParticipantStatuses(),
    findAllTestDates(),
    findAllSchools(),
    findAllTestAttempts(),
    findAllPpts(),
  ]);

  return [
    { cell: "Специальная категория", type: "boolean" },
    {
      cell: "Статус",
      type: nullableOptions(statuses.map((status) => ({ code: status.id, name: status.name }))),
    },
    {
      cell: "Дата тестирования",
      type: testDates.map((date) => ({
        code: date.id,
        name: formatDate(date.day, date.month, date.year),
      })),
    },
    { cell: "Результат", type: [...TEST_RESULT_SELECT_OPTIONS] },
    { cell: "Класс", type: "number" },
    {
      cell: "Школа, направившая",
      type: schools.map((school) => ({ code: school.code, name: school.name })),
    },
    {
      cell: "Попытка",
      type: attempts.map((attempt) => ({ code: attempt.number, name: attempt.name })),
    },
    {
      cell: "Апелляция",
      type: [{ code: null, name: "Не указано" }],
    },
    {
      cell: "ППТ",
      type: ppts.map((ppt) => ({ code: ppt.code, name: ppt.school_name })),
    },
  ];
}

export async function createTestResult(input: CreateTestResultInput): Promise<void> {
  if (input.result !== null && !isTestResultCode(input.result)) {
    const error = new Error("Некорректный код результата экзамена");
    Object.assign(error, { code: "INVALID_TEST_RESULT" });
    throw error;
  }

  await insertTestResult(input);
}
