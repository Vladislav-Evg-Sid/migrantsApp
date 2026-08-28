import {
  deleteTestResultById,
  findAllPptsWithParticipantCountByTestDateId,
  insertTestResult,
  testDateExistsById,
  updateTestResultById,
} from "../repositories/test-results.repository.js";
import {
  isTestResultCode,
  TEST_RESULT_SELECT_OPTIONS,
} from "../mappers/test-results.mapper.js";
import {
  findAllAreas,
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
  findAllTestDates,
} from "../repositories/reference-data.repository.js";
import type {
  ForeignKey,
  SelectOption,
  TableData,
  TableHeadCell,
} from "../types/reference-data.js";
import type {
  CreateTestResultInput,
  UpdateTestResultInput,
} from "../types/test-results.js";

function formatDate(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

function nullableOptions(options: SelectOption[]): SelectOption[] {
  return [...options, { code: null, name: "Не указано" }];
}

function foreignKey(code: number, name: string): ForeignKey {
  return { code, name };
}

export async function getPptsByTestDateId(
  testDateId: number,
): Promise<TableData | null> {
  const [testDateExists, rows, areas] = await Promise.all([
    testDateExistsById(testDateId),
    findAllPptsWithParticipantCountByTestDateId(testDateId),
    findAllAreas(),
  ]);

  if (!testDateExists) return null;

  return {
    head: [
      { cell: "Код ППТ", type: "number" },
      { cell: "Название школы", type: "string" },
      {
        cell: "Округ школы",
        type: areas.map((area) => foreignKey(area.code, area.name)),
      },
      { cell: "Код школы", type: "number" },
      { cell: "Количество участников", type: "number" },
    ],
    body: rows.map((row) => ({
      row: [
        row.ppt_code,
        row.ppt_name,
        foreignKey(row.area_code, row.area_name),
        row.school_code,
        row.participant_count,
      ],
    })),
  };
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
    { type: "boolean", cell: "Специальная категория Минпрос 727" },
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

export async function updateTestResult(
  id: number,
  input: UpdateTestResultInput,
): Promise<boolean> {
  if (input.result !== null && !isTestResultCode(input.result)) {
    const error = new Error("Некорректный код результата экзамена");
    Object.assign(error, { code: "INVALID_TEST_RESULT" });
    throw error;
  }

  return updateTestResultById(id, input);
}

export async function deleteTestResult(id: number): Promise<boolean> {
  return deleteTestResultById(id);
}
