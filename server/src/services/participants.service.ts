import {
  deleteParticipantById,
  findParticipantById,
  findParticipantExams,
  findParticipantsForTable,
  insertParticipantWithFirstExam,
  participantExistsById,
  updateParticipantById,
} from "../repositories/participants.repository.js";
import {
  findAllNations,
  pptExistsByCode,
} from "../repositories/reference-data.repository.js";
import type {
  CreateParticipantInput,
  CreatedParticipant,
  ParticipantData,
  UpdateParticipantInput,
} from "../types/participants.js";
import type { ForeignKey, TableData, TableHeadCell } from "../types/reference-data.js";
import type { ParticipantExamRow } from "../types/repository/participants.repository.types.js";
import {
  isTestResultCode,
  testResultCodeFromValue,
} from "../mappers/test-results.mapper.js";
import { getTestResultHead } from "./test-results.service.js";

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

function mapParticipantExams(
  exams: ParticipantExamRow[],
  head: TableHeadCell[],
): TableData {
  return {
    head,
    body: exams.map((exam) => ({
      row: [
        exam.id,
        exam.test_attempt_number,
        foreignKey(
          exam.test_date_id,
          formatDate(exam.test_day, exam.test_month, exam.test_year),
        ),
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
  };
}

async function loadParticipantExams(id: number): Promise<TableData> {
  const [exams, head] = await Promise.all([
    findParticipantExams(id),
    getTestResultHead(),
  ]);

  return mapParticipantExams(exams, head);
}

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

export async function getParticipantExams(id: number): Promise<TableData | null> {
  const [participantExists, exams] = await Promise.all([
    participantExistsById(id),
    loadParticipantExams(id),
  ]);

  return participantExists ? exams : null;
}

export async function updateParticipant(
  id: number,
  input: UpdateParticipantInput,
): Promise<boolean> {
  return updateParticipantById(id, input);
}

export async function deleteParticipant(id: number): Promise<boolean> {
  return deleteParticipantById(id);
}

export async function getParticipantDetails(id: number): Promise<ParticipantData | null> {
  const [participant, exams] = await Promise.all([
    findParticipantById(id),
    loadParticipantExams(id),
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
    exams,
  };
}
