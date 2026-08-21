import {
  findAllAreaResponsibles,
  findAllAreas,
  findAllNations,
  findAllParticipantStatuses,
  findAllPpts,
  findAllSchools,
  findAllTestAttempts,
  findAllTestDates,
} from "../repositories/reference-data.repository.js";
import type { TableData } from "../types/reference-data.js";

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
      { cell: "МО", type: areas.map((area) => area.name) },
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
      { cell: "Школа", type: schools.map((school) => school.name) },
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
      { cell: "МО", type: areas.map((area) => area.name) },
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
      { cell: "ID", type: "number" },
      { cell: "Название", type: "string" },
    ],
    body: rows.map((row) => ({ row: [row.id, row.name] })),
  };
}
