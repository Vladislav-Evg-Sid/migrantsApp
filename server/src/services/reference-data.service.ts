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
import type { AreaResponsible, Ppt, School } from "../types/reference-data.js";

export const getAreas = () => findAllAreas();

export async function getSchools(): Promise<School[]> {
  const rows = await findAllSchools();

  return rows.map((row) => ({
    code: row.code,
    name: row.name,
    address: row.address,
    area: {
      code: row.area_code,
      name: row.area_name,
    },
  }));
}

export async function getPpts(): Promise<Ppt[]> {
  const rows = await findAllPpts();

  return rows.map((row) => ({
    code: row.code,
    responsibleName: row.responsible_name,
    responsiblePhone: row.responsible_phone,
    school: {
      code: row.school_code,
      name: row.school_name,
    },
  }));
}

export async function getAreaResponsibles(): Promise<AreaResponsible[]> {
  const rows = await findAllAreaResponsibles();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    mail: row.mail,
    area: {
      code: row.area_code,
      name: row.area_name,
    },
  }));
}

export const getNations = () => findAllNations();

export const getParticipantStatuses = () => findAllParticipantStatuses();

export const getTestDates = () => findAllTestDates();

export const getTestAttempts = () => findAllTestAttempts();
