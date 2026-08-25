import type { ForeignKey } from "./tables";

interface ParticipantExams {
  attempt: number;
  date: string;
  school: ForeignKey;
  ppt: ForeignKey;
  grade: number;
  isDone: boolean;
  appealDate?: string;
  appealGranted?: boolean;
  participantPresents?: boolean;
}

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
  exams: ParticipantExams[];
}
