export type ParticipantRow = {
  id: string;
  surname: string;
  name: string;
  patronymic: string | null;
  birth_day: number;
  birth_month: number;
  birth_year: number;
  nation_id: number;
  confirmed_school_code: number | null;
  next_planned_date: string | null;
  comment: string | null;
  rcoi_note: string | null;
};
