export type TestResultValue = "Да" | "Нет" | "Неявка";

export type TestResultRow = {
  id: number;
  participant_id: string;
  is_special_category: boolean;
  status_id: number | null;
  test_date_id: number;
  result: TestResultValue | null;
  class: number;
  sending_school_code: number;
  test_attempt_number: number;
  appeal_id: number | null;
  testing_center_ppt_code: number;
};
