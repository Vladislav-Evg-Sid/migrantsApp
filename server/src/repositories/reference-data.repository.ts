import { pool } from "../db.js";
import type {
  AreaRow,
  AreaResponsibleRow,
  NationRow,
  ParticipantStatusRow,
  PptRow,
  SchoolRow,
  TestAttemptRow,
  TestDateRow,
} from "../types/repository/reference-data.repository.types.js";

export async function findAllAreas(): Promise<AreaRow[]> {
  const result = await pool.query<AreaRow>(
    "SELECT code, name FROM areas ORDER BY code"
  );
  return result.rows;
}

export async function findAllSchools(): Promise<SchoolRow[]> {
  const result = await pool.query<SchoolRow>(
    `SELECT
       schools.code,
       schools.name,
       schools.address,
       areas.code AS area_code,
       areas.name AS area_name
     FROM schools
     JOIN areas ON areas.code = schools.area_code
     ORDER BY schools.code`,
  );
  return result.rows;
}

export async function findAllPpts(): Promise<PptRow[]> {
  const result = await pool.query<PptRow>(
    `SELECT
       ppts.code,
       ppts.responsible_name,
       ppts.responsible_phone,
       schools.code AS school_code,
       schools.name AS school_name
     FROM ppts
     JOIN schools ON schools.code = ppts.school_code
     ORDER BY ppts.code`,
  );
  return result.rows;
}

export async function findAllAreaResponsibles(): Promise<AreaResponsibleRow[]> {
  const result = await pool.query<AreaResponsibleRow>(
    `SELECT
       area_responsibles.id,
       area_responsibles.name,
       area_responsibles.phone,
       area_responsibles.mail,
       areas.code AS area_code,
       areas.name AS area_name
     FROM area_responsibles
     JOIN areas ON areas.code = area_responsibles.area_code
     ORDER BY areas.code`,
  );
  return result.rows;
}

export async function findAllNations(): Promise<NationRow[]> {
  const result = await pool.query<NationRow>(
    "SELECT id, name FROM nations ORDER BY name"
  );
  return result.rows;
}

export async function findAllParticipantStatuses(): Promise<ParticipantStatusRow[]> {
  const result = await pool.query<ParticipantStatusRow>(
    "SELECT id, name FROM participant_statuses ORDER BY name",
  );
  return result.rows;
}

export async function findAllTestDates(): Promise<TestDateRow[]> {
  const result = await pool.query<TestDateRow>(
    "SELECT id, day, month, year FROM test_dates ORDER BY year, month, day",
  );
  return result.rows;
}

export async function findAllTestAttempts(): Promise<TestAttemptRow[]> {
  const result = await pool.query<TestAttemptRow>(
    "SELECT number, name FROM test_attempts ORDER BY number",
  );
  return result.rows;
}

export async function insertArea(code: number, name: string): Promise<void> {
  await pool.query(
    `INSERT INTO areas (code, name)
     VALUES ($1, $2)`,
    [code, name]);
}

export async function insertSchool(
  code: number,
  name: string,
  address: string,
  areaCode: number,
): Promise<void> {
  await pool.query(
    `INSERT INTO schools (code, name, address, area_code)
     VALUES ($1, $2, $3, $4)`,
    [code, name, address, areaCode],
  );
}

export async function insertPpt(
  code: number,
  schoolCode: number,
  responsibleName: string,
  responsiblePhone: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO ppts (code, school_code, responsible_name, responsible_phone)
     VALUES ($1, $2, $3, $4)`,
    [code, schoolCode, responsibleName, responsiblePhone],
  );
}

export async function insertAreaResponsible(
  areaCode: number,
  name: string,
  phone: string,
  mail: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO area_responsibles (area_code, name, phone, mail)
     VALUES ($1, $2, $3, $4)`,
    [areaCode, name, phone, mail],
  );
}

export async function insertNation(name: string): Promise<void> {
  await pool.query(
    `INSERT INTO nations (name)
     VALUES ($1)`,
    [name]);
}

export async function insertParticipantStatus(
  name: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO participant_statuses (name)
     VALUES ($1)`,
    [name]);
}

export async function insertTestDate(
  day: number,
  month: number,
  year: number,
): Promise<void> {
  await pool.query(
    `INSERT INTO test_dates (day, month, year)
     VALUES ($1, $2, $3)`,
    [day, month, year],
  );
}

export async function insertTestAttempt(
  number: number,
  name: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO test_attempts (number, name)
     VALUES ($1, $2)`,
    [number, name],
  );
}
