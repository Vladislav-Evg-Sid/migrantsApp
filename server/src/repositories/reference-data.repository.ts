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
    [code, name]
  );
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
    [name]
  );
}

export async function insertParticipantStatus(name: string): Promise<void> {
  await pool.query(
    `INSERT INTO participant_statuses (name)
     VALUES ($1)`,
    [name]
  );
}

export async function insertTestDate(day: number, month: number, year: number): Promise<void> {
  await pool.query(
    `INSERT INTO test_dates (day, month, year)
     VALUES ($1, $2, $3)`,
    [day, month, year],
  );
}

export async function insertTestAttempt(number: number, name: string): Promise<void> {
  await pool.query(
    `INSERT INTO test_attempts (number, name)
     VALUES ($1, $2)`,
    [number, name],
  );
}

export async function deleteAreaByCode(code: number): Promise<void> {
  await pool.query("DELETE FROM areas WHERE code = $1", [code]);
}

export async function deleteSchoolByCode(code: number): Promise<void> {
  await pool.query("DELETE FROM schools WHERE code = $1", [code]);
}

export async function deletePptByCode(code: number): Promise<void> {
  await pool.query("DELETE FROM ppts WHERE code = $1", [code]);
}

export async function deleteAreaResponsibleById(id: number): Promise<void> {
  await pool.query("DELETE FROM area_responsibles WHERE id = $1", [id]);
}

export async function deleteNationById(id: number): Promise<void> {
  await pool.query("DELETE FROM nations WHERE id = $1", [id]);
}

export async function deleteParticipantStatusById(id: number): Promise<void> {
  await pool.query("DELETE FROM participant_statuses WHERE id = $1", [id]);
}

export async function deleteTestDateById(id: number): Promise<void> {
  await pool.query("DELETE FROM test_dates WHERE id = $1", [id]);
}

export async function deleteTestAttemptByNumber(number: number): Promise<void> {
  await pool.query("DELETE FROM test_attempts WHERE number = $1", [number]);
}

export async function updateAreaByCode(code: number, name: string): Promise<void> {
  await pool.query(
    `UPDATE areas
     SET name = $1
     WHERE code = $2`, 
    [name, code]
  );
}

export async function updateSchoolByCode(
  code: number,
  name: string,
  address: string,
  areaCode: number,
): Promise<void> {
  await pool.query(
    `UPDATE schools
     SET name = $1, address = $2, area_code = $3
     WHERE code = $4`,
    [name, address, areaCode, code],
  );
}

export async function updatePptByCode(
  code: number,
  schoolCode: number,
  responsibleName: string,
  responsiblePhone: string,
): Promise<void> {
  await pool.query(
    `UPDATE ppts
     SET school_code = $1, responsible_name = $2, responsible_phone = $3
     WHERE code = $4`,
    [schoolCode, responsibleName, responsiblePhone, code],
  );
}

export async function updateAreaResponsibleById(
  id: number,
  areaCode: number,
  name: string,
  phone: string,
  mail: string,
): Promise<void> {
  await pool.query(
    `UPDATE area_responsibles
     SET area_code = $1, name = $2, phone = $3, mail = $4
     WHERE id = $5`,
    [areaCode, name, phone, mail, id],
  );
}

export async function updateNationById(id: number, name: string): Promise<void> {
  await pool.query(
    `UPDATE nations
     SET name = $1
     WHERE id = $2`,
    [name, id]
  );
}

export async function updateParticipantStatusById(id: number, name: string): Promise<void> {
  await pool.query(
    `UPDATE participant_statuses
     SET name = $1
     WHERE id = $2`,
    [name, id]
  );
}

export async function updateTestDateById(
  id: number,
  day: number,
  month: number,
  year: number,
): Promise<void> {
  await pool.query(
    `UPDATE test_dates
     SET day = $1, month = $2, year = $3
     WHERE id = $4`,
    [day, month, year, id],
  );
}

export async function updateTestAttemptByNumber(number: number, name: string): Promise<void> {
  await pool.query(
    `UPDATE test_attempts
     SET name = $1
     WHERE number = $2`,
    [name, number]
  );
}
