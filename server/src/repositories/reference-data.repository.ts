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
    "SELECT id, name FROM test_attempts ORDER BY id",
  );
  return result.rows;
}
