import { findAllParticipants } from "../repositories/participants.repository.js";
import type { ParticipantRow } from "../types/repository/participants.repository.types.js";

export async function getParticipants(): Promise<ParticipantRow[]> {
  return findAllParticipants();
}
