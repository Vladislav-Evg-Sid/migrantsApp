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
