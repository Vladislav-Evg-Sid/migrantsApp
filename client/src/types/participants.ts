import type { ForeignKey, TableData } from "./tables";

export interface ParticipantData {
  id: number;
  surname: string;
  name: string;
  patronymic?: string;
  birthDate: string;
  nation: ForeignKey;
  school?: ForeignKey;
  nextExamDate?: string;
  schoolComment?: string;
  rcoiNote?: string;
  exams: TableData;
}
