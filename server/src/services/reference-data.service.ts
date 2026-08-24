import {
  findAllAreaResponsibles,
  findAllAreas,
  findAllNations,
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
  findAllTestAttempts,
  findAllTestDates,
  deleteAreaByCode,
  deleteAreaResponsibleById,
  deleteNationById,
  deleteParticipantStatusById,
  deletePptByCode,
  deleteSchoolByCode,
  deleteTestAttemptByNumber,
  deleteTestDateById,
  insertArea,
  insertAreaResponsible,
  insertNation,
  insertParticipantStatus,
  insertPpt,
  insertSchool,
  insertTestAttempt,
  insertTestDate,
  updateAreaByCode,
  updateAreaResponsibleById,
  updateNationById,
  updateParticipantStatusById,
  updatePptByCode,
  updateSchoolByCode,
  updateTestAttemptByNumber,
  updateTestDateById,
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
  UpdateAreaInput,
  UpdateAreaResponsibleInput,
  UpdateNationInput,
  UpdateParticipantStatusInput,
  UpdatePptInput,
  UpdateSchoolInput,
  UpdateTestAttemptInput,
  UpdateTestDateInput,
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
      { cell: "Телефон", type: "phone" },
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
      { cell: "Телефон", type: "phone" },
      { cell: "Электронная почта", type: "email" },
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

export async function deleteArea(code: number) {
  await deleteAreaByCode(code);
}

export async function deleteSchool(code: number) {
  await deleteSchoolByCode(code);
}

export async function deletePpt(code: number) {
  await deletePptByCode(code);
}

export async function deleteAreaResponsible(id: number) {
  await deleteAreaResponsibleById(id);
}

export async function deleteNation(id: number) {
  await deleteNationById(id);
}

export async function deleteParticipantStatus(id: number) {
  await deleteParticipantStatusById(id);
}

export async function deleteTestDate(id: number) {
  await deleteTestDateById(id);
}

export async function deleteTestAttempt(number: number) {
  await deleteTestAttemptByNumber(number);
}

export async function updateArea(code: number, input: UpdateAreaInput) {
  await updateAreaByCode(code, input.name);
}

export async function updateSchool(code: number, input: UpdateSchoolInput) {
  await updateSchoolByCode(code, input.name, input.address, input.areaCode);
}

export async function updatePpt(code: number, input: UpdatePptInput) {
  await updatePptByCode(
    code,
    input.schoolCode,
    input.responsibleName,
    input.responsiblePhone,
  );
}

export async function updateAreaResponsible(id: number, input: UpdateAreaResponsibleInput) {
  await updateAreaResponsibleById(
    id,
    input.areaCode,
    input.name,
    input.phone,
    input.mail,
  );
}

export async function updateNation(id: number, input: UpdateNationInput) {
  await updateNationById(id, input.name);
}

export async function updateParticipantStatus(id: number, input: UpdateParticipantStatusInput) {
  await updateParticipantStatusById(id, input.name);
}

export async function updateTestDate(id: number, input: UpdateTestDateInput) {
  await updateTestDateById(id, input.day, input.month, input.year);
}

export async function updateTestAttempt(number: number, input: UpdateTestAttemptInput) {
  await updateTestAttemptByNumber(number, input.name);
}
