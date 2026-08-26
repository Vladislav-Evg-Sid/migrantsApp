import { insertTestResult } from "../repositories/test-results.repository.js";
import {
  isTestResultCode,
  TEST_RESULT_SELECT_OPTIONS,
} from "../mappers/test-results.mapper.js";
import {
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
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

export async function getTestResultHead(): Promise<TableHeadCell[]> {
  const [statuses, testDates, schools, ppts] = await Promise.all([
    findAllParticipantStatuses(),
    findAllTestDates(),
    findAllSchools(),
    findAllPpts(),
  ]);

  return [
    { type: "number", cell: "ID" },
    { type: "number", cell: "Попытка" },
    {
      cell: "Дата тестирования",
      type: testDates.map((date) => ({
        code: date.id,
        name: formatDate(date.day, date.month, date.year),
      })),
    },
    {
      cell: "Школа, направившая",
      type: schools.map((school) => ({ code: school.code, name: school.name })),
    },
    {
      cell: "ППТ",
      type: ppts.map((ppt) => ({ code: ppt.code, name: ppt.school_name })),
    },
    { type: "number", cell: "Класс" },
    { type: [...TEST_RESULT_SELECT_OPTIONS], cell: "Результат" },
    {
      type: nullableOptions(statuses.map((status) => ({ code: status.id, name: status.name }))),
      cell: "Статус",
    },
    { type: "boolean", cell: "Специальная категория" },
    { type: "date", cell: "Дата апелляции" },
    { type: "boolean", cell: "Апелляция удовлетворена" },
    { type: "boolean", cell: "Участник присутствовал" },
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
