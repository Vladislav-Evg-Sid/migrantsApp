import type { ForeignKey, TableData } from "./reference-data.js";

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
