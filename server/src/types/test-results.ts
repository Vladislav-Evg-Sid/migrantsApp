export type TestResultValue = "Да" | "Нет" | "Неявка";

export type CreateTestResultInput = {
  participantId: number;
  isSpecialCategory: boolean;
  statusId: number | null;
  testDateId: number;
  result: TestResultValue | null;
  class: number;
  sendingSchoolCode: number;
  testAttemptNumber: number;
  appealId: number | null;
  testingCenterPptCode: number;
};

export type CreateFirstTestResultInput = Omit<CreateTestResultInput, "participantId">;
