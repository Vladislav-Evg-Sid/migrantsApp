import type { ForeignKey, TableData } from "./tables";

export interface ParticipantData {
  id: number;
  surname: string;
  firstname: string;
  lastname?: string;
  birthday: string;
  nation: ForeignKey;
  school?: ForeignKey;
  nextExamDate?: string;
  comment?: string;
  rcoiNote?: string;
  exams: TableData;
}
