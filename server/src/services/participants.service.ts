import {
  findParticipantById,
  findParticipantExams,
  findParticipantsForTable,
  insertParticipantWithFirstExam,
} from "../repositories/participants.repository.js";
import {
  findAllNations,
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
  pptExistsByCode,
} from "../repositories/reference-data.repository.js";
import type {
  CreateParticipantInput,
  CreatedParticipant,
  ParticipantData,
} from "../types/participants.js";
import type { ForeignKey, SelectOption, TableData } from "../types/reference-data.js";
import {
  isTestResultCode,
  TEST_RESULT_OPTIONS,
  testResultCodeFromValue,
} from "../mappers/test-results.mapper.js";

function formatDate(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

function formatOptionalDate(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

function foreignKey(code: number, name: string): ForeignKey {
  return { code, name };
}

const resultOptions: SelectOption[] = [
  ...TEST_RESULT_OPTIONS,
  { code: null, name: "Не указано" },
];

export async function createParticipant(
  input: CreateParticipantInput,
): Promise<CreatedParticipant> {
  const pptCode = input.firstExam?.testingCenterPptCode;
  const classNumber = input.firstExam?.class;
  const result = input.firstExam?.result;
  if (
    !Number.isInteger(pptCode) ||
    !Number.isInteger(classNumber) ||
    classNumber < 1 ||
    classNumber > 11
  ) {
    const error = new Error("Для генерации ID нужны корректные код ППТ и класс");
    Object.assign(error, { code: "INVALID_PARTICIPANT_ID_SOURCE" });
    throw error;
  }

  if (result !== null && !isTestResultCode(result)) {
    const error = new Error("Некорректный код результата экзамена");
    Object.assign(error, { code: "INVALID_TEST_RESULT" });
    throw error;
  }

  if (!(await pptExistsByCode(pptCode))) {
    const error = new Error("ППТ с переданным кодом не найден");
    Object.assign(error, { code: "PPT_NOT_FOUND" });
    throw error;
  }

  return insertParticipantWithFirstExam(input);
}

export async function getParticipants(): Promise<TableData> {
  const [rows, nations] = await Promise.all([
    findParticipantsForTable(),
    findAllNations(),
  ]);

  return {
    head: [
      { type: "number", cell: "ID" },
      { type: "string", cell: "Фамилия" },
      { type: "string", cell: "Имя" },
      { type: "string", cell: "Отчество" },
      { type: "date", cell: "Дата рождения" },
      { type: nations.map((nation) => foreignKey(nation.id, nation.name)), cell: "Национальность" },
    ],
    body: rows.map((row) => ({
      row: [
        Number(row.id),
        row.surname,
        row.name,
        row.patronymic,
        formatDate(row.birth_day, row.birth_month, row.birth_year),
        foreignKey(row.nation_id, row.nation_name),
      ],
    })),
  };
}

export async function getParticipantDetails(id: number): Promise<ParticipantData | null> {
  const [participant, exams, schools, ppts, statuses] = await Promise.all([
    findParticipantById(id),
    findParticipantExams(id),
    findAllSchools(),
    findAllPpts(),
    findAllParticipantStatuses(),
  ]);

  if (!participant) return null;
  return {
    id: Number(participant.id),
    surname: participant.surname,
    name: participant.name,
    patronymic: participant.patronymic,
    birthDate: formatDate(participant.birth_day, participant.birth_month, participant.birth_year),
    nation: foreignKey(participant.nation_id, participant.nation_name),
    school: participant.confirmed_school_code && participant.confirmed_school_name
      ? foreignKey(participant.confirmed_school_code, participant.confirmed_school_name)
      : null,
    nextExamDate: formatOptionalDate(participant.next_planned_date),
    schoolComment: participant.comment,
    rcoiNote: participant.rcoi_note,
    exams: {
      head: [
        { type: "number", cell: "ID" },
        { type: "number", cell: "Попытка" },
        { type: "date", cell: "Дата тестирования" },
        { type: schools.map((school) => foreignKey(school.code, school.name)), cell: "Школа, направившая" },
        { type: ppts.map((ppt) => foreignKey(ppt.code, ppt.school_name)), cell: "ППТ" },
        { type: "number", cell: "Класс" },
        { type: resultOptions, cell: "Результат" },
        { type: statuses.map((status) => foreignKey(status.id, status.name)), cell: "Статус" },
        { type: "boolean", cell: "Специальная категория" },
        { type: "date", cell: "Дата апелляции" },
        { type: "boolean", cell: "Апелляция удовлетворена" },
        { type: "boolean", cell: "Участник присутствовал" },
      ],
      body: exams.map((exam) => ({
        row: [
          exam.id,
          exam.test_attempt_number,
          formatDate(exam.test_day, exam.test_month, exam.test_year),
          foreignKey(exam.sending_school_code, exam.sending_school_name),
          foreignKey(exam.testing_center_ppt_code, exam.testing_center_name),
          exam.class,
          exam.result ? foreignKey(testResultCodeFromValue(exam.result), exam.result) : null,
          exam.status_id && exam.status_name ? foreignKey(exam.status_id, exam.status_name) : null,
          exam.is_special_category,
          formatOptionalDate(exam.appeal_review_date),
          exam.appeal_is_granted,
          exam.appeal_is_appellant_present,
        ],
      })),
    },
  };
}
