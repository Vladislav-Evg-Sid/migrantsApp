import type { ForeignKey, TableData } from "./reference-data.js";
import type { CreateFirstTestResultInput } from "./test-results.js";

export type ParticipantData = {
  id: number;
  surname: string;
  name: string;
  patronymic: string | null;
  birthDate: string;
  nation: ForeignKey;
  school: ForeignKey | null;
  nextExamDate: string | null;
  schoolComment: string | null;
  rcoiNote: string | null;
  exams: TableData;
};

export type CreateParticipantInput = {
  surname: string;
  name: string;
  patronymic: string | null;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  nationId: number;
  confirmedSchoolCode: number | null;
  nextPlannedDate: string | null;
  comment: string | null;
  rcoiNote: string | null;
  firstExam: CreateFirstTestResultInput;
};

export type CreatedParticipant = {
  id: number;
};

export type UpdateParticipantInput = Omit<CreateParticipantInput, "firstExam">;
