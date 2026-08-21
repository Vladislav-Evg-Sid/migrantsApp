export type AreaRow = {
  code: number;
  name: string;
};

export type SchoolRow = {
  code: number;
  name: string;
  address: string;
  area_code: number;
  area_name: string;
};

export type PptRow = {
  code: number;
  responsible_name: string;
  responsible_phone: string;
  school_code: number;
  school_name: string;
};

export type AreaResponsibleRow = {
  id: number;
  name: string;
  phone: string;
  mail: string;
  area_code: number;
  area_name: string;
};

export type NationRow = {
  id: number;
  name: string;
};

export type ParticipantStatusRow = {
  id: number;
  name: string;
};

export type TestDateRow = {
  id: number;
  day: number;
  month: number;
  year: number;
};

export type TestAttemptRow = {
  number: number;
  name: string;
};
