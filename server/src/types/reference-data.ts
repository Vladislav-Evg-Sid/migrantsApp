export type Area = {
  code: number;
  name: string;
};

export type School = {
  code: number;
  name: string;
  address: string;
  area: Area;
};

export type Ppt = {
  code: number;
  responsibleName: string;
  responsiblePhone: string;
  school: Pick<School, "code" | "name">;
};

export type AreaResponsible = {
  id: number;
  name: string;
  phone: string;
  mail: string;
  area: Area;
};

export type Nation = {
  id: number;
  name: string;
};

export type ParticipantStatus = {
  id: number;
  name: string;
};

export type TestDate = {
  id: number;
  day: number;
  month: number;
  year: number;
};

export type TestAttempt = {
  id: number;
  name: string;
};
