import type { TableBodyRowData } from "../types/tables";
import type { ParticipantData } from "../types/participants";
import { createContext } from "react";

export interface ParticipantDataContextInterface {
  participantDetails: Omit<ParticipantData, "exams">;
  participantFirstExam: TableBodyRowData;
  setParticipantDetails: (
    participantDetails: Omit<ParticipantData, "exams">,
  ) => void;
  setParticipantFirstExam: (participantFirstExam: TableBodyRowData) => void;
  isCreating: boolean;
}

export const ParticipantDataContext =
  createContext<ParticipantDataContextInterface | null>(null);
