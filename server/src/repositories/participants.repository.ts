import { pool } from "../db.js";
import type { ParticipantRow } from "../types/repository/participants.repository.types.js";

export async function findAllParticipants(): Promise<ParticipantRow[]> {
  const result = await pool.query<ParticipantRow>(
    `SELECT
       id,
       surname,
       name,
       patronymic,
       birth_day,
       birth_month,
       birth_year,
       nation_id,
       confirmed_school_code,
       next_planned_date,
       comment,
       rcoi_note
     FROM participants
     ORDER BY id`,
  );

  return result.rows;
}
