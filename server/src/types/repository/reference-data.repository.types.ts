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
