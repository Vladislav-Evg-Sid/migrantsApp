import {
  findParticipantById,
  findParticipantExams,
  findParticipantsForTable,
} from "../repositories/participants.repository.js";
import {
  findAllNations,
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
} from "../repositories/reference-data.repository.js";
import type { ParticipantData } from "../types/participants.js";
import type { ForeignKey, TableData } from "../types/reference-data.js";

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
        { type: "number", cell: "Попытка" },
        { type: "date", cell: "Дата тестирования" },
        { type: schools.map((school) => foreignKey(school.code, school.name)), cell: "Школа, направившая" },
        { type: ppts.map((ppt) => foreignKey(ppt.code, ppt.school_name)), cell: "ППТ" },
        { type: "number", cell: "Класс" },
        { type: "string", cell: "Результат" },
        { type: statuses.map((status) => foreignKey(status.id, status.name)), cell: "Статус" },
        { type: "boolean", cell: "Специальная категория" },
        { type: "date", cell: "Дата апелляции" },
        { type: "boolean", cell: "Апелляция удовлетворена" },
        { type: "boolean", cell: "Участник присутствовал" },
      ],
      body: exams.map((exam) => ({
        row: [
          exam.test_attempt_number,
          formatDate(exam.test_day, exam.test_month, exam.test_year),
          foreignKey(exam.sending_school_code, exam.sending_school_name),
          foreignKey(exam.testing_center_ppt_code, exam.testing_center_name),
          exam.class,
          exam.result,
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
