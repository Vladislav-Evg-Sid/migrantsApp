export type ParticipantListRow = {
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
  nation_name: string;
};

export type ParticipantDetailsRow = {
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
  nation_name: string;
  confirmed_school_name: string | null;
};

export type ParticipantExamRow = {
  id: number;
  test_attempt_number: number;
  test_day: number;
  test_month: number;
  test_year: number;
  sending_school_code: number;
  sending_school_name: string;
  testing_center_ppt_code: number;
  testing_center_name: string;
  class: number;
  result: "Да" | "Нет" | "Неявка" | null;
  status_id: number | null;
  status_name: string | null;
  is_special_category: boolean;
  appeal_review_date: string | null;
  appeal_is_granted: boolean | null;
  appeal_is_appellant_present: boolean | null;
};
