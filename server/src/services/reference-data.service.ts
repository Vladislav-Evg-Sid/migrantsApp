import {
  findAllAreaResponsibles,
  findAllAreas,
  findAllNations,
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
  findAllTestAttempts,
  findAllTestDates,
  insertArea,
  insertAreaResponsible,
  insertNation,
  insertParticipantStatus,
  insertPpt,
  insertSchool,
  insertTestAttempt,
  insertTestDate,
} from "../repositories/reference-data.repository.js";
import type {
  CreateAreaInput,
  CreateAreaResponsibleInput,
  CreateNationInput,
  CreateParticipantStatusInput,
  CreatePptInput,
  CreateSchoolInput,
  CreateTestAttemptInput,
  CreateTestDateInput,
  TableData,
} from "../types/reference-data.js";

export async function getAreas(): Promise<TableData> {
  const rows = await findAllAreas();

  return {
    head: [
      { cell: "Код", type: "number" },
      { cell: "МО", type: "string" },
    ],
    body: rows.map((row) => ({ row: [row.code, row.name] })),
  };
}

export async function getSchools(): Promise<TableData> {
  const [rows, areas] = await Promise.all([findAllSchools(), findAllAreas()]);

  return {
    head: [
      { cell: "Код", type: "number" },
      { cell: "Название", type: "string" },
      { cell: "Адрес", type: "string" },
      {
        cell: "МО",
        type: areas.map((area) => ({ code: area.code, name: area.name })),
      },
    ],
    body: rows.map((row) => ({
      row: [
        row.code,
        row.name,
        row.address,
        { code: row.area_code, name: row.area_name },
      ],
    })),
  };
}

export async function getPpts(): Promise<TableData> {
  const [rows, schools] = await Promise.all([findAllPpts(), findAllSchools()]);

  return {
    head: [
      { cell: "Код", type: "number" },
      { cell: "Ответственный", type: "string" },
      { cell: "Телефон", type: "string" },
      {
        cell: "Школа",
        type: schools.map((school) => ({ code: school.code, name: school.name })),
      },
    ],
    body: rows.map((row) => ({
      row: [
        row.code,
        row.responsible_name,
        row.responsible_phone,
        { code: row.school_code, name: row.school_name },
      ],
    })),
  };
}

export async function getAreaResponsibles(): Promise<TableData> {
  const [rows, areas] = await Promise.all([findAllAreaResponsibles(), findAllAreas()]);

  return {
    head: [
      { cell: "ID", type: "number" },
      { cell: "Ответственный", type: "string" },
      { cell: "Телефон", type: "string" },
      { cell: "Электронная почта", type: "string" },
      {
        cell: "МО",
        type: areas.map((area) => ({ code: area.code, name: area.name })),
      },
    ],
    body: rows.map((row) => ({
      row: [
        row.id,
        row.name,
        row.phone,
        row.mail,
        { code: row.area_code, name: row.area_name },
      ],
    })),
  };
}

export async function getNations(): Promise<TableData> {
  const rows = await findAllNations();

  return {
    head: [
      { cell: "ID", type: "number" },
      { cell: "Национальность", type: "string" },
    ],
    body: rows.map((row) => ({ row: [row.id, row.name] })),
  };
}

export async function getParticipantStatuses(): Promise<TableData> {
  const rows = await findAllParticipantStatuses();

  return {
    head: [
      { cell: "ID", type: "number" },
      { cell: "Статус", type: "string" },
    ],
    body: rows.map((row) => ({ row: [row.id, row.name] })),
  };
}

export async function getTestDates(): Promise<TableData> {
  const rows = await findAllTestDates();

  return {
    head: [
      { cell: "ID", type: "number" },
      { cell: "День", type: "number" },
      { cell: "Месяц", type: "number" },
      { cell: "Год", type: "number" },
    ],
    body: rows.map((row) => ({ row: [row.id, row.day, row.month, row.year] })),
  };
}

export async function getTestAttempts(): Promise<TableData> {
  const rows = await findAllTestAttempts();

  return {
    head: [
      { cell: "Номер попытки", type: "number" },
      { cell: "Название", type: "string" },
    ],
    body: rows.map((row) => ({ row: [row.number, row.name] })),
  };
}

export async function createArea(input: CreateAreaInput) {
  await insertArea(input.code, input.name);
}

export async function createSchool(input: CreateSchoolInput) {
  await insertSchool(input.code, input.name, input.address, input.areaCode);
}

export async function createPpt(input: CreatePptInput) {
  await insertPpt(input.code, input.schoolCode, input.responsibleName, input.responsiblePhone);
}

export async function createAreaResponsible(input: CreateAreaResponsibleInput) {
  await insertAreaResponsible(input.areaCode, input.name, input.phone, input.mail);
}

export async function createNation(input: CreateNationInput) {
  await insertNation(input.name);
}

export async function createParticipantStatus(input: CreateParticipantStatusInput) {
  await insertParticipantStatus(input.name);
}

export async function createTestDate(input: CreateTestDateInput) {
  await insertTestDate(input.day, input.month, input.year);
}

export async function createTestAttempt(input: CreateTestAttemptInput) {
  await insertTestAttempt(input.number, input.name);
}
