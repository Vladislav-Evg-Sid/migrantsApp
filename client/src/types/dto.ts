import { type TableCellData, type ColumnTypes } from "./tables";

export type TableData = {
  head: {
    cell: string;
    type: ColumnTypes;
  }[];
  body: {
    row: TableCellData[];
  }[];
};

export type CreateAreaInput = {
  code: number;
  name: string;
};

export type CreateSchoolInput = {
  code: number;
  name: string;
  address: string;
  areaCode: number;
};

export type CreatePptInput = {
  code: number;
  schoolCode: number;
  responsibleName: string;
  responsiblePhone: string;
};

export type CreateAreaResponsibleInput = {
  areaCode: number;
  name: string;
  phone: string;
  mail: string;
};

export type CreateNationInput = {
  name: string;
};

export type CreateParticipantStatusInput = {
  name: string;
};

export type CreateTestDateInput = {
  day: number;
  month: number;
  year: number;
};

export type CreateTestAttemptInput = {
  number: number;
  name: string;
};

export type UpdateAreaInput = Omit<CreateAreaInput, "code">;

export type UpdateSchoolInput = Omit<CreateSchoolInput, "code">;

export type UpdatePptInput = Omit<CreatePptInput, "code">;

export type UpdateAreaResponsibleInput = CreateAreaResponsibleInput;

export type UpdateNationInput = CreateNationInput;

export type UpdateParticipantStatusInput = CreateParticipantStatusInput;

export type UpdateTestDateInput = CreateTestDateInput;

export type UpdateTestAttemptInput = Omit<CreateTestAttemptInput, "number">;

export type CreateTestResultInput = {
  participantId: number;
  isSpecialCategory: boolean;
  statusId: number | null;
  testDateId: number;
  result: 1 | 2 | 3 | null;
  class: number;
  sendingSchoolCode: number;
  testAttemptNumber: number;
  appealId: number | null;
  testingCenterPptCode: number;
};

export type CreateFirstTestResultInput = Omit<
  CreateTestResultInput,
  "participantId"
>;

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

export type UpdateParticipantInput = Omit<CreateParticipantInput, "firstExam">;

export type UpdateTestResultInput = CreateTestResultInput;
