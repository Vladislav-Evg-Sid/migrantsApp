import { pool } from "../db.js";
import type {
  Area,
  Nation,
  ParticipantStatus,
  TestAttempt,
  TestDate,
} from "../types/reference-data.js";
import type {
  AreaResponsibleRow,
  PptRow,
  SchoolRow,
} from "../types/repository/reference-data.repository.types.js";

export async function findAllAreas(): Promise<Area[]> {
  const result = await pool.query<Area>("SELECT code, name FROM areas ORDER BY code");
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

export async function findAllNations(): Promise<Nation[]> {
  const result = await pool.query<Nation>("SELECT id, name FROM nations ORDER BY name");
  return result.rows;
}

export async function findAllParticipantStatuses(): Promise<ParticipantStatus[]> {
  const result = await pool.query<ParticipantStatus>(
    "SELECT id, name FROM participant_statuses ORDER BY name",
  );
  return result.rows;
}

export async function findAllTestDates(): Promise<TestDate[]> {
  const result = await pool.query<TestDate>(
    "SELECT id, day, month, year FROM test_dates ORDER BY year, month, day",
  );
  return result.rows;
}

export async function findAllTestAttempts(): Promise<TestAttempt[]> {
  const result = await pool.query<TestAttempt>(
    "SELECT id, name FROM test_attempts ORDER BY id",
  );
  return result.rows;
}
