export type ForeignKey = {
  code: number;
  name: string;
};

export type SelectOption = {
  code: number | null;
  name: string;
};

export type ColumnType = "string" | "number" | "phone" | "email" | "date" | "boolean" | SelectOption[];

export type TableCellData = string | number | boolean | null | ForeignKey;

export type TableHeadCell = {
  cell: string;
  type: ColumnType;
};

export type TableData = {
  head: TableHeadCell[];
  body: {
    row: TableCellData[];
  }[];
};

export type ExamDateId = {
  id: number;
  day: number;
};

export type ExamDateMonthEntry = [month: number, dates: ExamDateId[]];
export type ExamDateYearEntry = [year: number, months: ExamDateMonthEntry[]];
export type ExamDates = ExamDateYearEntry[];

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
