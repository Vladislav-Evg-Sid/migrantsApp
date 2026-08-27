export type TestResultCode = 1 | 2 | 3;
export type TestResultValue = "Зачет" | "Незачет" | "Неявка";

export type CreateTestResultInput = {
  participantId: number;
  isSpecialCategory: boolean;
  statusId: number | null;
  testDateId: number;
  result: TestResultCode | null;
  class: number;
  sendingSchoolCode: number;
  testAttemptNumber: number;
  appealId: number | null;
  testingCenterPptCode: number;
};

export type CreateFirstTestResultInput = Omit<CreateTestResultInput, "participantId">;

export type UpdateTestResultInput = CreateTestResultInput;
